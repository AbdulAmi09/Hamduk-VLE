import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"
import { dbUtils } from "@/lib/db-utils"

/**
 * GET /api/classes?classId=...
 * Get class details
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

    const classData = await dbUtils.getClassById(classId)
    return NextResponse.json({ class: classData })
  } catch (error) {
    console.error("[v0] Error fetching class:", error)
    return NextResponse.json({ error: "Failed to fetch class" }, { status: 500 })
  }
}

/**
 * POST /api/classes
 * Create a new class
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const role = user.user_metadata?.role || "student"
    if (!["tutor", "instructor", "school_admin"].includes(role)) {
      return NextResponse.json({ error: "Only tutors can create classes" }, { status: 403 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from("classes")
      .insert({
        title: body.title,
        description: body.description,
        code: body.code,
        category: body.category,
        institution_id: body.institution_id,
        created_by: user.id,
        status: body.status || "draft",
        start_date: body.start_date,
        end_date: body.end_date,
      })
      .select()
      .single()

    if (error) throw error

    // Create notification for institution members (if applicable)
    if (body.institution_id) {
      const members = await dbUtils.getInstitutionMembers(body.institution_id)
      for (const member of members || []) {
        await dbUtils.createNotification(member.user_id, {
          title: "New Class Created",
          message: `New class "${body.title}" has been created`,
          notification_type: "class_created",
          related_resource_id: data.id,
        })
      }
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating class:", error)
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 })
  }
}

/**
 * PUT /api/classes
 * Update a class
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()

    // Verify user is class creator
    const { data: classData } = await supabase.from("classes").select("created_by").eq("id", body.classId).single()

    if (classData?.created_by !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("classes")
      .update({
        title: body.title,
        description: body.description,
        code: body.code,
        category: body.category,
        status: body.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.classId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error updating class:", error)
    return NextResponse.json({ error: "Failed to update class" }, { status: 500 })
  }
}
