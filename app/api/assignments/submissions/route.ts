import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

/**
 * GET /api/assignments/submissions
 * Get submissions for an assignment (instructor only)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get("assignmentId")

    if (!assignmentId) {
      return NextResponse.json({ error: "assignmentId required" }, { status: 400 })
    }

    // Verify user is instructor for this assignment
    const { data: assignment } = await supabase
      .from("assignments")
      .select("created_by")
      .eq("id", assignmentId)
      .single()

    if (assignment?.created_by !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all submissions
    const { data: submissions, error } = await supabase
      .from("assignment_submissions")
      .select("*, assignment_grades(*)")
      .eq("assignment_id", assignmentId)

    if (error) throw error

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error("[v0] Error fetching submissions:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}
