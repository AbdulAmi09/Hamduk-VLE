import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const courseId = request.nextUrl.searchParams.get("courseId")
    const supabase = await getSupabaseServer()

    if (!courseId) {
      return NextResponse.json({ error: "Course ID required" }, { status: 400 })
    }

    const { data: assessments, error } = await supabase
      .from("v_assessment_submission_status")
      .select("*")
      .eq("course_id", courseId)

    if (error) {
      console.error("[v0] Assessments fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 })
    }

    return NextResponse.json({ success: true, assessments })
  } catch (error) {
    console.error("[v0] Assessments fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { course_id, title, type, due_date, total_points } = await request.json()
    const supabase = await getSupabaseServer()

    if (!course_id || !title || !type) {
      return NextResponse.json({ error: "Course ID, title, and type required" }, { status: 400 })
    }

    const { data: newAssessment, error } = await supabase
      .from("assessments")
      .insert([
        {
          course_id,
          title,
          type,
          due_date,
          total_points,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create assessment" }, { status: 400 })
    }

    return NextResponse.json({ success: true, assessment: newAssessment })
  } catch (error) {
    console.error("[v0] Assessment creation error:", error)
    return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 })
  }
}
