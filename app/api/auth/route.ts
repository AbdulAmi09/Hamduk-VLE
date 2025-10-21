import { type NextRequest, NextResponse } from "next/server"

// This route is kept for backward compatibility but authentication is handled by Supabase Auth
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Use Supabase Auth for authentication. Sign up/in via the login page." },
    { status: 400 },
  )
}
