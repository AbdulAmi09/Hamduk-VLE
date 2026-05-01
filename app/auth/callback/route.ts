import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export async function GET(request: Request) {
  try {
    const requestUrl = request.url
    const url = new (global.URL || URL)(requestUrl)
    const { searchParams } = url
    const origin = url.origin
    const code = searchParams.get("code")

    if (code) {
      const cookieStore = await cookies()

      if (!SUPABASE_URL || !SUPABASE_KEY) {
        return NextResponse.redirect(`${origin}/`)
      }

      const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {
              // Ignore errors
            }
          },
        },
      })

      await supabase.auth.exchangeCodeForSession(code)
    }

    return NextResponse.redirect(`${origin}/dashboard`)
  } catch (error) {
    console.error("[v0] Auth callback error:", error)
    return NextResponse.redirect(new URL("/", "http://localhost:3000").toString())
  }
}
