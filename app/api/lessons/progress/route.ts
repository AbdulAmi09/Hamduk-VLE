import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

/**
 * GET /api/lessons/progress
 * Get lesson progress for a student
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
      .from("lesson_progress")
      .select("*")
      .eq("lesson_id", lessonId)
      .eq("student_id", user.id)
      .maybeSingle()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching progress:", error)
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/lessons/progress
 * Update lesson progress
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { lessonId, progressPercentage, completed } = body

    if (!lessonId) {
      return NextResponse.json({ error: "lessonId required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("lesson_progress")
      .upsert(
        {
          lesson_id: lessonId,
          student_id: user.id,
          progress_percentage: progressPercentage || 0,
          completed: completed || false,
          completed_at: completed ? new Date().toISOString() : null,
          last_accessed: new Date().toISOString(),
        },
        { onConflict: "lesson_id,student_id" }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error updating progress:", error)
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    )
  }
}
