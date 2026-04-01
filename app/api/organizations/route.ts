import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"
import { dbUtils } from "@/lib/db-utils"

/**
 * GET /api/organizations
 * Get organizations managed by the user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const role = user.user_metadata?.role || "student"
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "50"

    let query = supabase.from("institutions").select("*, organization_members(count)")

    // Filter by role
    if (!["platform_admin"].includes(role)) {
      // Non-admins see only organizations they're members of
      query = query.join("organization_members", "institutions.id", "organization_members.institution_id").eq("organization_members.user_id", user.id)
    }

    const { data, error } = await query.limit(parseInt(limit))

    if (error) throw error

    const organizations = data?.map((org: any) => ({
      id: org.id,
      name: org.name,
      website: org.website,
      description: org.description,
      member_count: org.organization_members?.[0]?.count || 0,
      created_at: org.created_at,
    }))

    return NextResponse.json({ organizations: organizations || [] })
  } catch (error) {
    console.error("[v0] Error fetching organizations:", error)
    return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 })
  }
}

/**
 * POST /api/organizations
 * Create a new organization
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const role = user.user_metadata?.role || "student"
    if (!["school_admin", "platform_admin"].includes(role)) {
      return NextResponse.json({ error: "Only admins can create organizations" }, { status: 403 })
    }

    const body = await request.json()

    // Create institution
    const { data: org, error: orgError } = await supabase
      .from("institutions")
      .insert({
        name: body.name,
        website: body.website,
        description: body.description,
      })
      .select()
      .single()

    if (orgError) throw orgError

    // Add creator as admin member
    const { error: memberError } = await supabase.from("organization_members").insert({
      institution_id: org.id,
      user_id: user.id,
      role: "admin",
    })

    if (memberError) throw memberError

    return NextResponse.json(org, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating organization:", error)
    return NextResponse.json({ error: "Failed to create organization" }, { status: 500 })
  }
}
