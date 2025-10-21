import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const eventType = request.nextUrl.searchParams.get("type")
    const courseId = request.nextUrl.searchParams.get("courseId")
    const supabase = await getSupabaseServer()

    if (!eventType) {
      return NextResponse.json({ error: "Event type required" }, { status: 400 })
    }

    // Fetch different data based on event type
    if (eventType === "attendance" && courseId) {
      const { data: attendance, error } = await supabase
        .from("v_lecture_attendance_summary")
        .select("*")
        .eq("course_id", courseId)

      if (error) throw error
      return NextResponse.json({ success: true, data: attendance })
    }

    if (eventType === "grades" && courseId) {
      const { data: grades, error } = await supabase
        .from("v_assessment_submission_status")
        .select("*")
        .eq("course_id", courseId)

      if (error) throw error
      return NextResponse.json({ success: true, data: grades })
    }

    if (eventType === "progress" && courseId) {
      const { data: progress, error } = await supabase
        .from("v_student_course_summary")
        .select("*")
        .eq("course_id", courseId)

      if (error) throw error
      return NextResponse.json({ success: true, data: progress })
    }

    return NextResponse.json({ error: "Invalid event type" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Realtime data error:", error)
    return NextResponse.json({ error: "Failed to fetch realtime data" }, { status: 500 })
  }
}
