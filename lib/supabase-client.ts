import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

function getEnvVar(key: string): string {
  return typeof window !== "undefined" ? "" : process.env[key] || ""
}

export function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = getEnvVar("SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL")
    const supabaseAnonKey = getEnvVar("SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY")

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Missing Supabase configuration. Ensure SUPABASE_NEXT_PUBLIC_SUPABASE_URL and SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
      )
    }

    supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}
