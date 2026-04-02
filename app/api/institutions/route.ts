import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"
import { dbUtils } from "@/lib/db-utils"

/**
 * GET /api/institutions?userId=...
 * Get user's affiliated institutions
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || user.id

    const institutions = await dbUtils.getUserInstitutions(userId)
    return NextResponse.json({ institutions })
  } catch (error) {
    console.error("[v0] Error fetching institutions:", error)
    return NextResponse.json({ error: "Failed to fetch institutions" }, { status: 500 })
  }
}

/**
 * POST /api/institutions
 * Add an institution affiliation
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()

    const { data, error } = await supabase
      .from("user_institutions")
      .insert({
        user_id: user.id,
        institution_id: body.institution_id,
        role: body.role || "student",
        status: "pending",
        joined_date: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Error adding institution:", error)
    return NextResponse.json({ error: "Failed to add institution" }, { status: 500 })
  }
}
