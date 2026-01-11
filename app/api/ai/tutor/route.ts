import { streamTutorResponse } from "@/lib/ai-client"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const { messages } = await request.json()

  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "Invalid messages format" }), { status: 400 })
  }

  try {
    const stream = await streamTutorResponse(messages)
    return stream.toTextStreamResponse()
  } catch (error) {
    console.error("[v0] AI Tutor error:", error)
    return new Response(JSON.stringify({ error: "Failed to generate response" }), { status: 500 })
  }
}
