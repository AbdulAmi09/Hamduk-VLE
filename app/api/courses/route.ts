import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()
    const instructorId = request.nextUrl.searchParams.get("instructorId")

    let query = supabase.from("v_instructor_course_overview").select("*")

    if (instructorId) {
      query = query.eq("instructor_id", instructorId)
    }

    const { data: courses, error } = await query

    if (error) {
      console.error("[v0] Courses fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
    }

    return NextResponse.json({ success: true, courses })
  } catch (error) {
    console.error("[v0] Courses fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, title, description, instructor_id, semester, start_date, end_date } = await request.json()
    const supabase = await getSupabaseServer()

    if (!code || !title || !instructor_id) {
      return NextResponse.json({ error: "Code, title, and instructor required" }, { status: 400 })
    }

    const { data: newCourse, error } = await supabase
      .from("courses")
      .insert([
        {
          code,
          title,
          description,
          instructor_id,
          semester,
          start_date,
          end_date,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create course" }, { status: 400 })
    }

    return NextResponse.json({ success: true, course: newCourse })
  } catch (error) {
    console.error("[v0] Course creation error:", error)
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}
