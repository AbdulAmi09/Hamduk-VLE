import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"
import { dbUtils } from "@/lib/db-utils"

/**
 * GET /api/live-sessions?classId=...
 * Get live sessions for a class
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")

    if (!classId) {
      return NextResponse.json({ error: "classId required" }, { status: 400 })
    }

    const sessions = await dbUtils.getLiveSessionsByClass(classId)
    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("[v0] Error fetching live sessions:", error)
    return NextResponse.json({ error: "Failed to fetch live sessions" }, { status: 500 })
  }
}

/**
 * POST /api/live-sessions
 * Create a live session (tutor only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const role = user.user_metadata?.role || "student"
    if (!["tutor", "instructor", "school_admin"].includes(role)) {
      return NextResponse.json({ error: "Only tutors can create sessions" }, { status: 403 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from("live_sessions")
      .insert({
        class_id: body.class_id,
        title: body.title,
        description: body.description,
        session_date: body.session_date,
        duration_minutes: body.duration_minutes,
        status: "scheduled",
      })
      .select()
      .single()

    if (error) throw error

    // Create notifications for all students in the class
    const classStudents = await dbUtils.getClassStudents(body.class_id)
    for (const student of classStudents || []) {
      await dbUtils.createNotification(student.id, {
        title: "New Live Session",
        message: `New session "${body.title}" scheduled`,
        notification_type: "live_session_scheduled",
        related_resource_id: data.id,
      })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating live session:", error)
    return NextResponse.json({ error: "Failed to create live session" }, { status: 500 })
  }
}
