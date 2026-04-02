import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

/**
 * GET /api/lessons?classId=...
 * Get lessons and modules for a class
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

    // Get modules with lessons
    const { data: modules, error } = await supabase
      .from("modules")
      .select(
        `
        id,
        title,
        description,
        order_index,
        lessons (
          id,
          title,
          description,
          video_url,
          duration_minutes,
          order_index,
          lesson_completions (id)
        )
      `,
      )
      .eq("class_id", classId)
      .order("order_index", { ascending: true })

    if (error) throw error

    // Transform to include completion status
    const modulesWithCompletion = modules?.map((module: any) => ({
      ...module,
      lessons: module.lessons?.map((lesson: any) => ({
        ...lesson,
        completed: lesson.lesson_completions?.length > 0,
        watched_percentage: 0,
      })),
    }))

    return NextResponse.json({ modules: modulesWithCompletion || [] })
  } catch (error) {
    console.error("[v0] Error fetching lessons:", error)
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 })
  }
}

/**
 * POST /api/lessons
 * Create a new lesson
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const role = user.user_metadata?.role || "student"
    if (!["tutor", "instructor", "school_admin"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from("lessons")
      .insert({
        module_id: body.moduleId,
        title: body.title,
        description: body.description,
        video_url: body.video_url,
        duration_minutes: body.duration_minutes,
        order_index: body.order_index || 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating lesson:", error)
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 })
  }
}

/**
 * PUT /api/lessons
 * Update a lesson
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()

    const { data, error } = await supabase
      .from("lessons")
      .update({
        title: body.title,
        description: body.description,
        video_url: body.video_url,
        duration_minutes: body.duration_minutes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.lessonId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error updating lesson:", error)
    return NextResponse.json({ error: "Failed to update lesson" }, { status: 500 })
  }
}

/**
 * DELETE /api/lessons?lessonId=...
 * Delete a lesson
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get("lessonId")

    if (!lessonId) {
      return NextResponse.json({ error: "lessonId required" }, { status: 400 })
    }

    const { error } = await supabase.from("lessons").delete().eq("id", lessonId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting lesson:", error)
    return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 })
  }
}
