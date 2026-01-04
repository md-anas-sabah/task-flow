import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ListTodo, Calendar, User } from "lucide-react"
import Link from "next/link"
import { CreateTaskButton } from "@/components/tasks/create-task-button"

async function getTasks(userId: string) {
  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { creatorId: userId },
        { assigneeId: userId }
      ]
    },
    include: {
      project: { select: { name: true, color: true } },
      assignee: { select: { name: true } },
      _count: { select: { comments: true } }
    },
    orderBy: { createdAt: "desc" }
  })

  return tasks
}

export default async function TasksPage() {
  const session = await auth()
  const tasks = session?.user?.id ? await getTasks(session.user.id) : []

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
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track all your tasks
          </p>
        </div>
        <CreateTaskButton />
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ListTodo className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first task to get started
            </p>
            <CreateTaskButton />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Link key={task.id} href={`/tasks/${task.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        <Badge variant={statusColors[task.status as keyof typeof statusColors] as any}>
                          {task.status.replace("_", " ")}
                        </Badge>
                        <Badge variant={priorityColors[task.priority as keyof typeof priorityColors] as any}>
                          {task.priority}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        {task.project && (
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded"
                              style={{ backgroundColor: task.project.color }}
                            />
                            <span>{task.project.name}</span>
                          </div>
                        )}

                        {task.assignee && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{task.assignee.name}</span>
                          </div>
                        )}

                        {task.dueDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}

                        {task._count.comments > 0 && (
                          <span>{task._count.comments} comment{task._count.comments !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
