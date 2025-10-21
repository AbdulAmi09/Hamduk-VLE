import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const URL = process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL || ""
const KEY = proSUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY || ""

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const cookieStore = await cookies()

    if (!URL || !KEY) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    const supabase = createServerClient(URL, KEY, {
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

  return NextResponse.redirect(new URL("/dashboard", request.url))
}
