import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const URL = process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL || ""
const KEY = process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY || ""

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const publicRoutes = ["/", "/auth/forgot-password", "/auth/reset-password", "/auth/callback"]

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/courses") || pathname.startsWith("/lectures")) {
    try {
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

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        return NextResponse.redirect(new URL("/", request.url))
      }
    } catch (error) {
      console.error("Auth error:", error)
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
