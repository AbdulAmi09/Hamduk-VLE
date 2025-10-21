import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function getSupabaseServer() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ""

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase configuration in server environment")
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Handle cookie setting errors silently
        }
      },
    },
  })
}
