import { explainConcept } from "@/lib/ai-client"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { topic, currentLevel, courseContext } = await request.json()

  if (!topic || !courseContext) {
    return NextResponse.json({ error: "Topic and courseContext required" }, { status: 400 })
  }

  try {
    const explanation = await explainConcept(topic, currentLevel || "beginner", courseContext)
    return NextResponse.json({ success: true, explanation })
  } catch (error) {
    console.error("[v0] Explain error:", error)
    return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 })
  }
}
