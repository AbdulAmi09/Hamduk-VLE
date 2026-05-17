import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

/**
 * GET /api/assignments/grades
 * Get grades for a student or assignment
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get("assignmentId")
    const studentId = searchParams.get("studentId")

    let query = supabase.from("assignment_grades").select("*")

    if (assignmentId) {
      query = query.eq("assignment_id", assignmentId)
    }

    if (studentId) {
      // Students can only see their own grades
      if (studentId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      query = query.eq("student_id", studentId)
    }

    const { data: grades, error } = await query

    if (error) throw error

    return NextResponse.json({ grades })
  } catch (error) {
    console.error("[v0] Error fetching grades:", error)
    return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 })
  }
}

/**
 * POST /api/assignments/grades
 * Create or update a grade
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()

    // Verify user is instructor for this assignment
    const { data: assignment } = await supabase
      .from("assignments")
      .select("created_by")
      .eq("id", body.assignmentId)
      .single()

    if (assignment?.created_by !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: grade, error } = await supabase
      .from("assignment_grades")
      .upsert(
        {
          submission_id: body.submissionId,
          assignment_id: body.assignmentId,
          student_id: body.studentId,
          marks_obtained: body.marksObtained,
          feedback: body.feedback || null,
          graded_at: new Date().toISOString(),
          graded_by: user.id,
        },
        { onConflict: "submission_id" },
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(grade, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating grade:", error)
    return NextResponse.json({ error: "Failed to create grade" }, { status: 500 })
  }
}
