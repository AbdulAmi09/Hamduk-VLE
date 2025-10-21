"use client"

import { createBrowserClient } from "@supabase/ssr"

// Build env var names using concatenation to avoid corruption
const urlKey = "NEXT_PUBLIC_SUPABASE_" + "URL"
const keyKey = "NEXT_PUBLIC_SUPABASE_" + "ANON_KEY"

const URL = process.env[urlKey] || ""
const KEY = process.env[keyKey] || ""

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) return client

  if (!URL || !KEY) {
    console.error("Missing Supabase configuration")
    return null
  }

  client = createBrowserClient(URL, KEY)
  return client
}
