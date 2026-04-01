import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"
import { dbUtils } from "@/lib/db-utils"

/**
 * GET /api/grades
 * Get grades for user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")

    if (!classId) {
      return NextResponse.json({ error: "classId required" }, { status: 400 })
    }

    const role = user.user_metadata?.role || "student"

    // Students get their own grades, tutors get class grades
    let grades
    if (role === "student") {
      grades = await dbUtils.getStudentGrades(user.id, classId)
    } else {
      grades = await dbUtils.getClassGrades(classId)
    }

    return NextResponse.json({ grades })
  } catch (error) {
    console.error("[v0] Error fetching grades:", error)
    return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 })
  }
}

/**
 * POST /api/grades
 * Record a grade (tutor only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const role = user.user_metadata?.role || "student"
    if (role === "student") {
      return NextResponse.json({ error: "Students cannot record grades" }, { status: 403 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from("grades")
      .insert({
        class_id: body.class_id,
        student_id: body.student_id,
        assessment_id: body.assessment_id,
        assessment_type: body.assessment_type,
        score: body.score,
        percentage: body.percentage || (body.score / 100) * 100,
      })
      .select()
      .single()

    if (error) throw error

    // Create notification for student
    await dbUtils.createNotification(body.student_id, {
      title: "Grade Released",
      message: `You received a grade on "${body.assessment_title}"`,
      notification_type: "grade_released",
      related_resource_id: body.assessment_id,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Error recording grade:", error)
    return NextResponse.json({ error: "Failed to record grade" }, { status: 500 })
  }
}
