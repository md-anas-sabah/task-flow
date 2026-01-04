import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EditProfileForm } from "@/components/profile/edit-profile-form"
import { User, Mail, Briefcase, Building2, Calendar, CheckCircle, Clock } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          tasks: true,
          createdTasks: true,
          projects: true,
          ownedProjects: true,
        }
      }
    }
  })

  const completedTasks = await prisma.task.count({
    where: {
      assigneeId: userId,
      status: "COMPLETED"
    }
  })

  return { user, completedTasks }
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  const { user, completedTasks } = await getUserProfile(session.user.id)

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Info */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="h-24 w-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <Badge variant="secondary" className="mt-2">
                    {user.role}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4" />
                  <span>Tasks Assigned</span>
                </div>
                <span className="font-semibold">{user._count.tasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Completed</span>
                </div>
                <span className="font-semibold">{completedTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Created Tasks</span>
                </div>
                <span className="font-semibold">{user._count.createdTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>Projects</span>
                </div>
                <span className="font-semibold">{user._count.projects + user._count.ownedProjects}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDateTime(user.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Profile Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditProfileForm user={user} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
