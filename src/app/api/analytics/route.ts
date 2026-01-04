import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/analytics - Get dashboard analytics
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get tasks where user is involved
    const userTasksWhere = {
      OR: [
        { creatorId: session.user.id },
        { assigneeId: session.user.id },
        { project: { members: { some: { id: session.user.id } } } },
        { project: { ownerId: session.user.id } },
      ],
    }

    // Task statistics by status
    const tasksByStatus = await prisma.task.groupBy({
      by: ["status"],
      where: userTasksWhere,
      _count: true,
    })

    // Task statistics by priority
    const tasksByPriority = await prisma.task.groupBy({
      by: ["priority"],
      where: userTasksWhere,
      _count: true,
    })

    // Total tasks
    const totalTasks = await prisma.task.count({
      where: userTasksWhere,
    })

    // Completed tasks
    const completedTasks = await prisma.task.count({
      where: {
        ...userTasksWhere,
        status: "COMPLETED",
      },
    })

    // Overdue tasks
    const overdueTasks = await prisma.task.count({
      where: {
        ...userTasksWhere,
        dueDate: {
          lt: new Date(),
        },
        status: {
          not: "COMPLETED",
        },
      },
    })

    // Tasks assigned to me
    const myTasks = await prisma.task.count({
      where: {
        assigneeId: session.user.id,
        status: {
          not: "COMPLETED",
        },
      },
    })

    // Recent activities
    const recentActivities = await prisma.activity.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { project: { members: { some: { id: session.user.id } } } },
          { project: { ownerId: session.user.id } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    })

    // Project statistics
    const totalProjects = await prisma.project.count({
      where: {
        OR: [
          { ownerId: session.user.id },
          { members: { some: { id: session.user.id } } },
        ],
        isArchived: false,
      },
    })

    // Upcoming tasks (next 7 days)
    const upcomingTasks = await prisma.task.findMany({
      where: {
        ...userTasksWhere,
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        status: {
          not: "COMPLETED",
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
      take: 5,
    })

    return NextResponse.json({
      summary: {
        totalTasks,
        completedTasks,
        overdueTasks,
        myTasks,
        totalProjects,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      tasksByStatus: tasksByStatus.map(item => ({
        status: item.status,
        count: item._count,
      })),
      tasksByPriority: tasksByPriority.map(item => ({
        priority: item.priority,
        count: item._count,
      })),
      recentActivities,
      upcomingTasks,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
