import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"
import speakeasy from "speakeasy"
import QRCode from "qrcode"

/**
 * POST /api/auth/2fa-setup
 * Setup TOTP 2FA for a user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Hamduk VLE (${user.email})`,
      length: 32,
    })

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!)

    // Store temporary secret in session (don't enable yet)
    const { error: updateError } = await supabase
      .from("two_factor_settings")
      .upsert({
        user_id: user.id,
        secret_key: secret.base32,
        is_enabled: false,
      })

    if (updateError) throw updateError

    return NextResponse.json({
      qrCode,
      manualKey: secret.base32,
      secret: secret.base32,
    })
  } catch (error) {
    console.error("[v0] 2FA setup error:", error)
    return NextResponse.json({ error: "Failed to setup 2FA" }, { status: 500 })
  }
}
