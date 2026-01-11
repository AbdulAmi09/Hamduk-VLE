import { detectKnowledgeGaps } from "@/lib/ai-client"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { scores } = await request.json()

  if (!scores || !Array.isArray(scores)) {
    return NextResponse.json({ error: "Scores array required" }, { status: 400 })
  }

  try {
    const gaps = await detectKnowledgeGaps(scores)
    return NextResponse.json({ success: true, gaps })
  } catch (error) {
    console.error("[v0] Gap detection error:", error)
    return NextResponse.json({ error: "Failed to detect gaps" }, { status: 500 })
  }
}
