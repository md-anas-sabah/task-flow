import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { z } from "zod"

const suggestTasksSchema = z.object({
  projectDescription: z.string(),
  existingTasks: z.array(z.string()).optional(),
})

// POST /api/ai/suggest-tasks - Generate AI-powered task suggestions
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "AI features are not configured" },
        { status: 503 }
      )
    }

    const body = await request.json()
    const validatedData = suggestTasksSchema.parse(body)

    const existingTasksContext = validatedData.existingTasks?.length
      ? `\n\nExisting tasks:\n${validatedData.existingTasks.join("\n")}`
      : ""

    const { text } = await generateText({
      model: openai("gpt-4-turbo"),
      prompt: `You are a helpful project management assistant. Based on the following project description, suggest 5-7 specific, actionable tasks that would help complete this project successfully.

Project Description: ${validatedData.projectDescription}${existingTasksContext}

Please provide tasks in the following JSON format:
[
  {
    "title": "Task title",
    "description": "Detailed task description",
    "priority": "HIGH|MEDIUM|LOW",
    "estimatedHours": number,
    "tags": ["tag1", "tag2"]
  }
]

Make sure tasks are:
1. Specific and actionable
2. Properly prioritized
3. Include realistic time estimates
4. Have relevant tags for categorization
5. Don't duplicate existing tasks if provided`,
    })

    // Parse the AI response
    let suggestedTasks
    try {
      // Extract JSON from the response (AI might wrap it in markdown code blocks)
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        suggestedTasks = JSON.parse(jsonMatch[0])
      } else {
        suggestedTasks = JSON.parse(text)
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      return NextResponse.json(
        { error: "Failed to parse AI suggestions" },
        { status: 500 }
      )
    }

    return NextResponse.json({ tasks: suggestedTasks })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      )
    }

    console.error("Error generating task suggestions:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
