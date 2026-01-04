import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Get all projects owned by current user
    const userProjects = await prisma.project.findMany({
      where: { ownerId: session.user.id },
      select: { id: true }
    })

    // Add new user to all these projects
    await Promise.all(
      userProjects.map(project =>
        prisma.project.update({
          where: { id: project.id },
          data: {
            members: {
              connect: { id: userId }
            }
          }
        })
      )
    )

    return NextResponse.json({
      message: "User added to projects",
      projectsCount: userProjects.length
    })
  } catch (error) {
    console.error("Add to projects error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
