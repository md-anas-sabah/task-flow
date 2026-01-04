import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, User, MessageSquare, Folder } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import { AddCommentForm } from "@/components/tasks/add-comment-form"

async function getTask(taskId: string, userId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      OR: [
        { creatorId: userId },
        { assigneeId: userId },
        { project: { members: { some: { id: userId } } } }
      ]
    },
    include: {
      project: { select: { id: true, name: true, color: true } },
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true, email: true } },
      comments: {
        include: {
          user: { select: { name: true, avatar: true } }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  })

  return task
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id) {
    notFound()
  }

  const task = await getTask(id, session.user.id)

  if (!task) {
    notFound()
  }

  const statusColors = {
    TODO: "secondary",
    IN_PROGRESS: "default",
    IN_REVIEW: "blue",
    COMPLETED: "green",
    CANCELLED: "destructive",
  }

  const priorityColors = {
    LOW: "secondary",
    MEDIUM: "yellow",
    HIGH: "orange",
    URGENT: "destructive",
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/tasks">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-3xl font-bold">{task.title}</h1>
            <Badge variant={statusColors[task.status as keyof typeof statusColors] as any}>
              {task.status.replace("_", " ")}
            </Badge>
            <Badge variant={priorityColors[task.priority as keyof typeof priorityColors] as any}>
              {task.priority}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {task.description ? (
                <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
              ) : (
                <p className="text-muted-foreground italic">No description provided</p>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments ({task.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AddCommentForm taskId={task.id} />

              <div className="space-y-4">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold shrink-0">
                      {comment.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{comment.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(comment.createdAt)}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}

                {task.comments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.project && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    Project
                  </p>
                  <Link href={`/projects/${task.project.id}`}>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors">
                      <div
                        className="h-3 w-3 rounded"
                        style={{ backgroundColor: task.project.color }}
                      />
                      <p className="font-medium text-sm">{task.project.name}</p>
                    </div>
                  </Link>
                </div>
              )}

              {task.assignee && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Assigned to
                  </p>
                  <div className="flex items-center gap-2 p-2">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      {task.assignee.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{task.assignee.name}</p>
                      <p className="text-xs text-muted-foreground">{task.assignee.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {task.dueDate && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </p>
                  <p className="font-medium text-sm">
                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              <div className="space-y-1 pt-4 border-t">
                <p className="text-xs text-muted-foreground">Created by</p>
                <p className="text-sm font-medium">{task.creator.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(task.createdAt)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
