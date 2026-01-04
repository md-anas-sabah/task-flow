import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InviteUserButton } from "@/components/settings/invite-user-button"
import { Users, Mail, Calendar, UserCog } from "lucide-react"
import { formatDateTime } from "@/lib/utils"

async function getTeamMembers(userId: string) {
  // Get all projects where current user is owner or member
  const userProjects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { id: userId } } }
      ]
    },
    select: {
      ownerId: true,
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          jobTitle: true,
          department: true,
          createdAt: true,
          _count: {
            select: {
              tasks: true,
              projects: true,
            }
          }
        }
      },
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          jobTitle: true,
          department: true,
          createdAt: true,
          _count: {
            select: {
              tasks: true,
              projects: true,
            }
          }
        }
      }
    }
  })

  // Collect unique team members
  const teamMembersMap = new Map()

  userProjects.forEach(project => {
    // Add owner
    if (!teamMembersMap.has(project.owner.id)) {
      teamMembersMap.set(project.owner.id, project.owner)
    }
    // Add members
    project.members.forEach(member => {
      if (!teamMembersMap.has(member.id)) {
        teamMembersMap.set(member.id, member)
      }
    })
  })

  return Array.from(teamMembersMap.values())
}

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  const teamMembers = await getTeamMembers(session.user.id)

  if (!session?.user) {
    return null
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER"

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your team and application settings
        </p>
      </div>

      <Tabs defaultValue="team" className="space-y-6">
        <TabsList>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members ({teamMembers.length})</CardTitle>
                  <CardDescription>
                    Manage team members who can be assigned to tasks
                  </CardDescription>
                </div>
                {isAdmin && <InviteUserButton />}
              </div>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Users className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No team members yet</h3>
                  <p className="text-muted-foreground text-center mb-6 max-w-md">
                    Start building your team by adding members. They can be assigned to tasks and projects.
                  </p>
                  {isAdmin && <InviteUserButton />}
                </div>
              ) : (
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <Card key={member.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg shrink-0">
                              {member.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 space-y-3">
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <h3 className="font-semibold text-lg">{member.name}</h3>
                                  <Badge variant="secondary">{member.role}</Badge>
                                  {member.id === session.user.id && (
                                    <Badge variant="outline">You</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Mail className="h-4 w-4" />
                                  <span>{member.email}</span>
                                </div>
                              </div>

                              {(member.jobTitle || member.department) && (
                                <div className="flex items-center gap-4 text-sm">
                                  {member.jobTitle && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <UserCog className="h-4 w-4" />
                                      <span>{member.jobTitle}</span>
                                    </div>
                                  )}
                                  {member.department && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Users className="h-4 w-4" />
                                      <span>{member.department}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <span>{member._count.tasks} tasks assigned</span>
                                <span>{member._count.projects} projects</span>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Joined {formatDateTime(member.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Theme customization coming soon...
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Notification preferences coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
