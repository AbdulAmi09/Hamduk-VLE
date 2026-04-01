import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"
import { dbUtils } from "@/lib/db-utils"

/**
 * POST /api/assignments/[assignmentId]/submit
 * Submit an assignment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { assignmentId: string } },
) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { assignmentId } = params
    const body = await request.json()

    // Get assignment
    const { data: assignment, error: fetchError } = await supabase
      .from("assignments")
      .select("*")
      .eq("id", assignmentId)
      .single()

    if (fetchError || !assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    // Check due date
    const dueDate = new Date(assignment.due_date)
    const now = new Date()
    const isLate = now > dueDate

    if (isLate && !assignment.allow_late_submission) {
      return NextResponse.json({ error: "Assignment deadline has passed" }, { status: 400 })
    }

    // Submit assignment
    const submission = await dbUtils.submitAssignment(assignmentId, user.id, {
      submission_text: body.text || null,
      file_url: body.file_url || null,
      is_late: isLate,
    })

    // Add XP
    if (!isLate) {
      await dbUtils.addXP(user.id, assignment.class_id, 50, "assignment_submission")
    }

    // Create notification for tutor
    const tutorId = assignment.created_by
    await dbUtils.createNotification(tutorId, {
      title: "New Assignment Submission",
      message: `Student submitted "${assignment.title}"`,
      notification_type: "assignment_submitted",
      related_resource_id: assignmentId,
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error("[v0] Error submitting assignment:", error)
    return NextResponse.json({ error: "Failed to submit assignment" }, { status: 500 })
  }
}

/**
 * GET /api/assignments/[assignmentId]/submit
 * Get submission for current user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { assignmentId: string } },
) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { assignmentId } = params

    const { data: submission, error } = await supabase
      .from("assignment_submissions")
      .select("*, grade:assignment_grades(*)")
      .eq("assignment_id", assignmentId)
      .eq("student_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") throw error

    return NextResponse.json({ submission: submission || null })
  } catch (error) {
    console.error("[v0] Error fetching submission:", error)
    return NextResponse.json({ error: "Failed to fetch submission" }, { status: 500 })
  }
}
