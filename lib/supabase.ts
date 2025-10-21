import { createBrowserClient, createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Build env var names using concatenation to avoid corruption
const urlKey = "NEXT_PUBLIC_SUPABASE_" + "URL"
const keyKey = "NEXT_PUBLIC_SUPABASE_" + "ANON_KEY"

const URL = process.env[urlKey] || ""
const KEY = process.env[keyKey] || ""

let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (typeof window === "undefined") {
    return null
  }

  if (!browserClient) {
    browserClient = createBrowserClient(URL, KEY)
  }

  return browserClient
}

export async function createServerSideClient() {
  const cookieStore = await cookies()

  return createServerClient(URL, KEY, {
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
}
