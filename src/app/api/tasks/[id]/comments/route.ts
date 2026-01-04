import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
})

// POST /api/tasks/[id]/comments - Add a comment to a task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if user has access to this task
    const task = await prisma.task.findFirst({
      where: {
        id,
        OR: [
          { creatorId: session.user.id },
          { assigneeId: session.user.id },
          { project: { members: { some: { id: session.user.id } } } },
          { project: { ownerId: session.user.id } },
        ],
      },
    })

    if (!task) {
      return NextResponse.json(
        { error: "Task not found or access denied" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = createCommentSchema.parse(body)

    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        taskId: id,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    })

    // Create activity log
    await prisma.activity.create({
      data: {
        type: "commented",
        content: `Commented on "${task.title}"`,
        userId: session.user.id,
        taskId: task.id,
        projectId: task.projectId,
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      )
    }

    console.error("Error creating comment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
