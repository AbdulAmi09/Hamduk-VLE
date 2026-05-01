import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"
import speakeasy from "speakeasy"

/**
 * POST /api/auth/2fa-verify
 * Verify TOTP code and enable 2FA
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { code } = await request.json()

    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 })

    // Get user's 2FA settings
    const { data: twoFactorSettings, error: fetchError } = await supabase
      .from("two_factor_settings")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (fetchError || !twoFactorSettings) {
      return NextResponse.json({ error: "2FA not setup" }, { status: 400 })
    }

    // Verify code
    const isValid = speakeasy.verify({
      secret: twoFactorSettings.secret_key,
      encoding: "base32",
      token: code,
      window: 2,
    })

    if (!isValid) return NextResponse.json({ error: "Invalid code" }, { status: 401 })

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substr(2, 8).toUpperCase(),
    )

    // Enable 2FA
    const { error: updateError } = await supabase
      .from("two_factor_settings")
      .update({
        is_enabled: true,
        backup_codes: backupCodes,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      backupCodes,
      message: "2FA enabled successfully",
    })
  } catch (error) {
    console.error("[v0] 2FA verify error:", error)
    return NextResponse.json({ error: "Failed to verify 2FA" }, { status: 500 })
  }
}

/**
 * GET /api/auth/2fa-verify
 * Check if user has 2FA enabled
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: twoFactorSettings } = await supabase
      .from("two_factor_settings")
      .select("is_enabled")
      .eq("user_id", user.id)
      .single()

    return NextResponse.json({
      is2FAEnabled: twoFactorSettings?.is_enabled || false,
    })
  } catch (error) {
    console.error("[v0] 2FA check error:", error)
    return NextResponse.json({ error: "Failed to check 2FA status" }, { status: 500 })
  }
}
