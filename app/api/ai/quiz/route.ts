import { generatePracticeQuiz } from "@/lib/ai-client"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { topic, difficulty, count } = await request.json()

  if (!topic || !difficulty) {
    return NextResponse.json({ error: "Topic and difficulty required" }, { status: 400 })
  }

  try {
    const quiz = await generatePracticeQuiz(topic, difficulty, count || 5)
    return NextResponse.json({ success: true, quiz })
  } catch (error) {
    console.error("[v0] Quiz generation error:", error)
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 })
  }
}
