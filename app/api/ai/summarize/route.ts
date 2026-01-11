import { summarizeContent } from "@/lib/ai-client"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { content, type } = await request.json()

  if (!content || !["video", "pdf", "article"].includes(type)) {
    return NextResponse.json({ error: "Content and valid type required" }, { status: 400 })
  }

  try {
    const summary = await summarizeContent(content, type)
    return NextResponse.json({ success: true, summary })
  } catch (error) {
    console.error("[v0] Summarize error:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
