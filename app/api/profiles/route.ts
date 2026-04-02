import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"
import { dbUtils } from "@/lib/db-utils"

/**
 * GET /api/profiles?userId=...
 * Get user profile information
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || user.id

    // Can only view own profile or if admin
    if (userId !== user.id) {
      const role = user.user_metadata?.role || "student"
      if (!["school_admin", "platform_admin"].includes(role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const profile = await dbUtils.getUserById(userId)
    return NextResponse.json({ profile })
  } catch (error) {
    console.error("[v0] Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

/**
 * PUT /api/profiles
 * Update user profile
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()

    const { data, error } = await supabase
      .from("users")
      .update({
        full_name: body.full_name,
        display_name: body.display_name,
        bio: body.bio,
        country: body.country,
        timezone: body.timezone,
        language_preference: body.language_preference,
        linkedin_url: body.linkedin_url,
        twitter_url: body.twitter_url,
        website_url: body.website_url,
        profile_visibility: body.profile_visibility,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ profile: data })
  } catch (error) {
    console.error("[v0] Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
