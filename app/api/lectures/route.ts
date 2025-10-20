import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const courseId = request.nextUrl.searchParams.get("courseId")
    const supabase = await getSupabaseServer()

    if (!courseId) {
      return NextResponse.json({ error: "Course ID required" }, { status: 400 })
    }

    const { data: lectures, error } = await supabase
      .from("lectures")
      .select("*")
      .eq("course_id", courseId)
      .order("scheduled_date", { ascending: true })

    if (error) {
      console.error("[v0] Lectures fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch lectures" }, { status: 500 })
    }

    return NextResponse.json({ success: true, lectures })
  } catch (error) {
    console.error("[v0] Lectures fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch lectures" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { course_id, title, description, video_url, duration_minutes, scheduled_date, is_mandatory } =
      await request.json()
    const supabase = await getSupabaseServer()

    if (!course_id || !title) {
      return NextResponse.json({ error: "Course ID and title required" }, { status: 400 })
    }

    const { data: newLecture, error } = await supabase
      .from("lectures")
      .insert([
        {
          course_id,
          title,
          description,
          video_url,
          duration_minutes,
          scheduled_date,
          is_mandatory,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create lecture" }, { status: 400 })
    }

    return NextResponse.json({ success: true, lecture: newLecture })
  } catch (error) {
    console.error("[v0] Lecture creation error:", error)
    return NextResponse.json({ error: "Failed to create lecture" }, { status: 500 })
  }
}
