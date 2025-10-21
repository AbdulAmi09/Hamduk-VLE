import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/auth/forgot-password", "/auth/reset-password", "/auth/callback"]

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Protected routes - check if user is authenticated
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/courses") || pathname.startsWith("/lectures")) {
    try {
      const cookieStore = await cookies()
      const supabaseUrl = process.env.SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL || ""
      const supabaseAnonKey = process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY || ""

      if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.redirect(new URL("/", request.url))
      }

      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {
              // Handle cookie setting errors
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
      console.error("[v0] Middleware auth check error:", error)
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
