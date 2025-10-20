import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { assessment_id, student_id, score, feedback } = await request.json()
    const supabase = await getSupabaseServer()

    if (!assessment_id || !student_id || score === undefined) {
      return NextResponse.json({ error: "Assessment ID, student ID, and score required" }, { status: 400 })
    }

    const { data: grade, error } = await supabase
      .from("grades")
      .upsert(
        [
          {
            assessment_id,
            student_id,
            score,
            feedback,
            graded_at: new Date().toISOString(),
          },
        ],
        { onConflict: "assessment_id,student_id" },
      )
      .select()
      .single()

    if (error) {
      console.error("[v0] Grade submission error:", error)
      return NextResponse.json({ error: "Failed to submit grade" }, { status: 500 })
    }

    return NextResponse.json({ success: true, grade })
  } catch (error) {
    console.error("[v0] Grade submission error:", error)
    return NextResponse.json({ error: "Failed to submit grade" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const studentId = request.nextUrl.searchParams.get("studentId")
    const supabase = await getSupabaseServer()

    if (!studentId) {
      return NextResponse.json({ error: "Student ID required" }, { status: 400 })
    }

    const { data: grades, error } = await supabase
      .from("grades")
      .select(
        `
        id,
        score,
        feedback,
        submitted_at,
        graded_at,
        assessments:assessment_id(title, total_points, type)
      `,
      )
      .eq("student_id", studentId)
      .order("graded_at", { ascending: false })

    if (error) {
      console.error("[v0] Grades fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 })
    }

    return NextResponse.json({ success: true, grades })
  } catch (error) {
    console.error("[v0] Grades fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 })
  }
}
