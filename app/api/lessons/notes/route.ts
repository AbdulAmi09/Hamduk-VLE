import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

/**
 * GET /api/lessons/notes
 * Get lesson notes
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const lessonId = request.nextUrl.searchParams.get("lessonId")
    if (!lessonId) {
      return NextResponse.json({ error: "lessonId required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("lesson_notes")
      .select("*")
      .eq("lesson_id", lessonId)
      .eq("student_id", user.id)
      .order("timestamp_seconds")

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[v0] Error fetching notes:", error)
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/lessons/notes
 * Create a lesson note
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { lessonId, timestamp, content } = body

    if (!lessonId || !content) {
      return NextResponse.json(
        { error: "lessonId and content required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("lesson_notes")
      .insert({
        lesson_id: lessonId,
        student_id: user.id,
        timestamp_seconds: timestamp || 0,
        content,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error creating note:", error)
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/lessons/notes
 * Delete a lesson note
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const noteId = request.nextUrl.searchParams.get("noteId")
    if (!noteId) {
      return NextResponse.json({ error: "noteId required" }, { status: 400 })
    }

    // Verify note ownership
    const { data: note } = await supabase
      .from("lesson_notes")
      .select("student_id")
      .eq("id", noteId)
      .single()

    if (note?.student_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error } = await supabase
      .from("lesson_notes")
      .delete()
      .eq("id", noteId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting note:", error)
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    )
  }
}
