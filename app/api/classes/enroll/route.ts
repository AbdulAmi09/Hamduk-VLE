import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"
import { dbUtils } from "@/lib/db-utils"

/**
 * POST /api/classes/enroll
 * Enroll a student in a class
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { classId } = body

    if (!classId) {
      return NextResponse.json({ error: "classId required" }, { status: 400 })
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from("class_enrollments")
      .select("id")
      .eq("class_id", classId)
      .eq("student_id", user.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: "Already enrolled" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("class_enrollments")
      .insert({
        class_id: classId,
        student_id: user.id,
        enrollment_date: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Get class info and notify tutor
    const classData = await dbUtils.getClassById(classId)
    if (classData?.created_by) {
      await dbUtils.createNotification(classData.created_by, {
        title: "New Student Enrolled",
        message: `A student has enrolled in "${classData.title}"`,
        notification_type: "student_enrolled",
        related_resource_id: classId,
      })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Error enrolling student:", error)
    return NextResponse.json({ error: "Failed to enroll" }, { status: 500 })
  }
}

/**
 * DELETE /api/classes/enroll
 * Unenroll from a class
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { classId } = body

    if (!classId) {
      return NextResponse.json({ error: "classId required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("class_enrollments")
      .delete()
      .eq("class_id", classId)
      .eq("student_id", user.id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: "Unenrolled successfully",
    })
  } catch (error) {
    console.error("[v0] Error unenrolling:", error)
    return NextResponse.json({ error: "Failed to unenroll" }, { status: 500 })
  }
}
