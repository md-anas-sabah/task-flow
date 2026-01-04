import { auth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, ListTodo, FolderKanban, AlertCircle } from "lucide-react"
import Link from "next/link"
import { formatDateTime } from "@/lib/utils"
import { prisma } from "@/lib/prisma"

async function getAnalytics(userId: string) {
  try {
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const [
      totalTasks,
      completedTasks,
      myTasks,
      overdueTasks,
      totalProjects,
      upcomingTasks,
      recentActivities,
      tasksByStatus,
      tasksByPriority,
    ] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { status: "COMPLETED" } }),
      prisma.task.count({ where: { assigneeId: userId } }),
      prisma.task.count({ where: { dueDate: { lt: now }, status: { not: "COMPLETED" } } }),
      prisma.project.count(),
      prisma.task.findMany({
        where: {
          dueDate: { gte: now, lte: sevenDaysFromNow },
          status: { notIn: ["COMPLETED", "CANCELLED"] },
        },
        include: { project: true },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
      prisma.activity.findMany({
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.task.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.task.groupBy({
        by: ["priority"],
        _count: { priority: true },
      }),
    ])

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      summary: {
        totalTasks,
        completedTasks,
        myTasks,
        overdueTasks,
        totalProjects,
        completionRate,
      },
      upcomingTasks,
      recentActivities,
      tasksByStatus: tasksByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      tasksByPriority: tasksByPriority.map(item => ({
        priority: item.priority,
        count: item._count.priority,
      })),
    }
  } catch (error) {
    console.error("Analytics error:", error)
    return null
  }
}

export default async function DashboardPage() {
  const session = await auth()
  const analytics = session?.user?.id ? await getAnalytics(session.user.id) : null

  const stats = [
    {
      title: "Total Tasks",
      value: analytics?.summary?.totalTasks || 0,
      icon: ListTodo,
      description: "All your tasks",
    },
    {
      title: "Completed",
      value: analytics?.summary?.completedTasks || 0,
      icon: CheckCircle2,
      description: `${analytics?.summary?.completionRate || 0}% completion rate`,
      color: "text-green-600",
    },
    {
      title: "In Progress",
      value: analytics?.summary?.myTasks || 0,
      icon: Clock,
      description: "Assigned to you",
      color: "text-blue-600",
    },
    {
      title: "Overdue",
      value: analytics?.summary?.overdueTasks || 0,
      icon: AlertCircle,
      description: "Need attention",
      color: "text-red-600",
    },
    {
      title: "Projects",
      value: analytics?.summary?.totalProjects || 0,
      icon: FolderKanban,
      description: "Active projects",
      color: "text-purple-600",
    },
  ]

  const priorityColors = {
    URGENT: "destructive",
    HIGH: "orange",
    MEDIUM: "yellow",
    LOW: "secondary",
  }

  const statusColors = {
    TODO: "secondary",
    IN_PROGRESS: "default",
    IN_REVIEW: "blue",
    COMPLETED: "green",
    CANCELLED: "destructive",
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {session?.user?.name}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your tasks today
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color || "text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Upcoming Tasks */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.upcomingTasks && analytics.upcomingTasks.length > 0 ? (
                analytics.upcomingTasks.map((task: any) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{task.title}</p>
                        <Badge variant={priorityColors[task.priority as keyof typeof priorityColors] as any}>
                          {task.priority}
                        </Badge>
                      </div>
                      {task.project && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: task.project.color }}
                          />
                          {task.project.name}
                        </p>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No upcoming tasks in the next 7 days
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.recentActivities?.slice(0, 5).map((activity: any) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user.name}</span>{" "}
                      {activity.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              {!analytics?.recentActivities?.length && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Distribution Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.tasksByStatus?.map((item: any) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColors[item.status as keyof typeof statusColors] as any}>
                      {item.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.tasksByPriority?.map((item: any) => (
                <div key={item.priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={priorityColors[item.priority as keyof typeof priorityColors] as any}>
                      {item.priority}
                    </Badge>
                  </div>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
