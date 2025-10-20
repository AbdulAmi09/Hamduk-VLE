import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { lecture_id, student_id, watched_duration_minutes } = await request.json()
    const supabase = await getSupabaseServer()

    if (!lecture_id || !student_id) {
      return NextResponse.json({ error: "Lecture ID and Student ID required" }, { status: 400 })
    }

    const { data: attendance, error } = await supabase
      .from("attendance")
      .upsert(
        [
          {
            lecture_id,
            student_id,
            watched_duration_minutes,
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
