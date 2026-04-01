import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

/**
 * GET /api/organizations/members?orgId=...
 * Get organization members
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get("orgId")

    if (!orgId) {
      return NextResponse.json({ error: "orgId required" }, { status: 400 })
    }

    // Verify user is org member/admin
    const { data: userMembership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("institution_id", orgId)
      .eq("user_id", user.id)
      .single()

    if (!userMembership && user.user_metadata?.role !== "platform_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("organization_members")
      .select("*, user:user_id(full_name, email, role)")
      .eq("institution_id", orgId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ members: data || [] })
  } catch (error) {
    console.error("[v0] Error fetching members:", error)
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}

/**
 * POST /api/organizations/members
 * Add member to organization
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()

    // Verify user is org admin
    const { data: userMembership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("institution_id", body.orgId)
      .eq("user_id", user.id)
      .single()

    if (userMembership?.role !== "admin" && user.user_metadata?.role !== "platform_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("organization_members")
      .insert({
        institution_id: body.orgId,
        user_id: body.userId,
        role: body.role || "member",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Error adding member:", error)
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 })
  }
}
