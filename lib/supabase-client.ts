"use client"

import { createBrowserClient } from "@supabase/ssr"

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!URL || !KEY) {
  console.error("Missing Supabase configuration")
}

export const supabase = createBrowserClient(URL, KEY)

export const createClient = () => createBrowserClient(URL, KEY)
