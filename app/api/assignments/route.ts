import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"
import { dbUtils } from "@/lib/db-utils"

/**
 * GET /api/assignments
 * Get assignments for classes the user is enrolled in
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const role = user.user_metadata?.role || "student"
    const userClasses = await dbUtils.getUserClasses(user.id, role)

    // Get all assignments from user's classes
    let assignments: any[] = []
    for (const cls of userClasses) {
      const classAssignments = await dbUtils.getAssignmentsByClass(cls.id)
      assignments.push(
        ...classAssignments.map((a: any) => ({
          ...a,
          className: cls.title,
          classId: cls.id,
        })),
      )
    }

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error("[v0] Error fetching assignments:", error)
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 })
  }
}

/**
 * POST /api/assignments
 * Create a new assignment (tutor only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const role = user.user_metadata?.role || "student"
    if (role === "student") {
      return NextResponse.json({ error: "Only tutors can create assignments" }, { status: 403 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from("assignments")
      .insert({
        class_id: body.class_id,
        created_by: user.id,
        title: body.title,
        description: body.description || null,
        instructions: body.instructions || null,
        due_date: body.due_date,
        allow_late_submission: body.allow_late_submission || false,
        submission_type: body.submission_type || "both",
        allowed_file_types: body.allowed_file_types || [],
        max_file_size_mb: body.max_file_size_mb || 10,
        marks_available: body.marks_available || 100,
        weight: body.weight || 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating assignment:", error)
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 })
  }
}
