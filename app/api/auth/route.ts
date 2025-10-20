import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { action, email, password, full_name } = await request.json()
    const supabase = await getSupabaseServer()

    if (action === "login") {
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password required" }, { status: 400 })
      }

      const { data: user, error } = await supabase
        .from("users")
        .select("id, email, full_name, role, avatar_url")
        .eq("email", email)
        .single()

      if (error || !user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      return NextResponse.json({ success: true, user, token: "auth-token" })
    }

    if (action === "signup") {
      if (!email || !password || !full_name) {
        return NextResponse.json({ error: "All fields required" }, { status: 400 })
      }

      const { data: newUser, error } = await supabase
        .from("users")
        .insert([
          {
            email,
            password_hash: password,
            full_name,
            role: "student",
          },
        ])
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: "Signup failed" }, { status: 400 })
      }

      return NextResponse.json({ success: true, user: newUser })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
