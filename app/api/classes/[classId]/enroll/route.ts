import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"
import { dbUtils } from "@/lib/db-utils"

/**
 * POST /api/classes/[classId]/enroll
 * Enroll a student in a class
 */
export async function POST(request: NextRequest, { params }: { params: { classId: string } }) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { classId } = params
    const body = await request.json()
    const enrollmentCode = body.code

    // Get class to verify it exists
    const classData = await dbUtils.getClassById(classId)
    if (!classData) return NextResponse.json({ error: "Class not found" }, { status: 404 })

    // Verify enrollment code if class is not open
    if (classData.visibility === "invite_only" && classData.class_code !== enrollmentCode) {
      return NextResponse.json({ error: "Invalid enrollment code" }, { status: 401 })
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from("class_enrollments")
      .select("id")
      .eq("class_id", classId)
      .eq("student_id", user.id)
      .single()

    if (existing) return NextResponse.json({ error: "Already enrolled" }, { status: 400 })

    // Enroll student
    const enrollment = await dbUtils.enrollStudent(classId, user.id)

    // Add XP for enrollment
    await dbUtils.addXP(user.id, classId, 10, "class_enrollment")

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    console.error("[v0] Error enrolling in class:", error)
    return NextResponse.json({ error: "Failed to enroll" }, { status: 500 })
  }
}

/**
 * DELETE /api/classes/[classId]/enroll
 * Unenroll a student from a class
 */
export async function DELETE(request: NextRequest, { params }: { params: { classId: string } }) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { classId } = params

    const { error } = await supabase
      .from("class_enrollments")
      .delete()
      .eq("class_id", classId)
      .eq("student_id", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error unenrolling from class:", error)
    return NextResponse.json({ error: "Failed to unenroll" }, { status: 500 })
  }
}
