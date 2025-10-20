import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { action, email, password, firstName, lastName } = await request.json()

    if (action === "login") {
      // Validate credentials
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password required" }, { status: 400 })
      }

      // Mock authentication - replace with real DB query
      const user = {
        id: "user-123",
        email,
        firstName: "John",
        lastName: "Doe",
        role: "instructor",
      }

      return NextResponse.json({ success: true, user, token: "mock-jwt-token" })
    }

    if (action === "signup") {
      if (!email || !password || !firstName || !lastName) {
        return NextResponse.json({ error: "All fields required" }, { status: 400 })
      }

      const newUser = {
        id: `user-${Date.now()}`,
        email,
        firstName,
        lastName,
        role: "student",
      }

      return NextResponse.json({ success: true, user: newUser, token: "mock-jwt-token" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
