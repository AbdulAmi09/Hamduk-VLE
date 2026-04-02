import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"

/**
 * DELETE /api/account/delete
 * Delete user account and all associated data
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { password, confirmDelete } = body

    if (!password || confirmDelete !== "DELETE_ACCOUNT") {
      return NextResponse.json({ error: "Confirmation required" }, { status: 400 })
    }

    // Delete user from auth (this will cascade to related data)
    const { error } = await supabase.auth.admin.deleteUser(user.id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    })
  } catch (error) {
    console.error("[v0] Error deleting account:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
