import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { course_id, method, email, emails } = await request.json()
    const supabase = await getSupabaseServer()

    if (!course_id) {
      return NextResponse.json({ error: "Course ID required" }, { status: 400 })
    }

    if (method === "manual" && email) {
      const { data: student } = await supabase.from("users").select("id").eq("email", email).single()

      if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 })
      }

      const { data: enrollment, error } = await supabase
        .from("enrollments")
        .insert([{ student_id: student.id, course_id }])
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: "Enrollment failed" }, { status: 400 })
      }

      return NextResponse.json({ success: true, enrollment })
    }

    if (method === "bulk" && emails) {
      const { data: students } = await supabase.from("users").select("id").in("email", emails)

      if (!students || students.length === 0) {
        return NextResponse.json({ error: "No students found" }, { status: 404 })
      }

      const enrollments = students.map((s) => ({
        student_id: s.id,
        course_id,
      }))

      const { data: results, error } = await supabase.from("enrollments").insert(enrollments).select()

      if (error) {
        return NextResponse.json({ error: "Bulk enrollment failed" }, { status: 400 })
      }

      return NextResponse.json({ success: true, enrollments: results, count: results.length })
    }

    return NextResponse.json({ error: "Invalid enrollment method" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Enrollment error:", error)
    return NextResponse.json({ error: "Failed to enroll student" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const courseId = request.nextUrl.searchParams.get("courseId")
    const supabase = await getSupabaseServer()

    if (!courseId) {
      return NextResponse.json({ error: "Course ID required" }, { status: 400 })
    }

    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select(
        `
        id,
        student_id,
        enrollment_date,
        status,
        users:student_id(full_name, email)
      `,
      )
      .eq("course_id", courseId)
      .eq("status", "active")

    if (error) {
      console.error("[v0] Enrollment fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 })
    }

    return NextResponse.json({ success: true, enrollments })
  } catch (error) {
    console.error("[v0] Enrollment fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 })
  }
}
