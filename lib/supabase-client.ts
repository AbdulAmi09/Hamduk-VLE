"use client"

import { createBrowserClient } from "@supabase/ssr"

const URL = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_URL : ""
const KEY = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : ""

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export const createClient = () => {
  // Return cached client if available
  if (supabaseClient) return supabaseClient

  if (!URL || !KEY) {
    console.warn(
      "[v0] Supabase environment variables missing. Check Vars section.\n" +
        "Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY",
    )
    return null
  }

  try {
    supabaseClient = createBrowserClient(URL, KEY)
    return supabaseClient
  } catch (error) {
    console.error("[v0] Failed to create Supabase client:", error)
    return null
  }
}

export const supabase = createClient()
