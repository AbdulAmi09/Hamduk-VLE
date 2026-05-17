import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lecture_id, lessonId, student_id, watched_duration_minutes } = body
    const supabase = await getSupabaseServer()

    // Support both lecture_id and lessonId (for lesson player)
    const actualLectureId = lecture_id || lessonId

    if (!actualLectureId) {
      return NextResponse.json({ error: "Lecture ID or lesson ID required" }, { status: 400 })
    }

    // Get current user if student_id not provided
    let userId = student_id
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      userId = user.id
    }

    const { data: attendance, error } = await supabase
      .from("attendance")
      .upsert(
        [
          {
            lecture_id: actualLectureId,
            student_id: userId,
            watched_duration_minutes: watched_duration_minutes || 0,
            attended: true,
            marked_at: new Date().toISOString(),
          },
        ],
        { onConflict: "lecture_id,student_id" },
      )
      .select()
      .single()

    if (error) {
      console.error("[v0] Attendance error:", error)
      return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 })
    }

    return NextResponse.json({ success: true, attendance })
  } catch (error) {
    console.error("[v0] Attendance error:", error)
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const lectureId = request.nextUrl.searchParams.get("lectureId")
    const supabase = await getSupabaseServer()

    if (!lectureId) {
      return NextResponse.json({ error: "Lecture ID required" }, { status: 400 })
    }

    const { data: attendanceRecords, error } = await supabase
      .from("attendance")
      .select(
        `
        id,
        lecture_id,
        student_id,
        attended,
        watched_duration_minutes,
        marked_at,
        users:student_id(full_name, email)
      `,
      )
      .eq("lecture_id", lectureId)

    if (error) {
      console.error("[v0] Attendance fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
    }

    return NextResponse.json({ success: true, attendance: attendanceRecords })
  } catch (error) {
    console.error("[v0] Attendance fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}
