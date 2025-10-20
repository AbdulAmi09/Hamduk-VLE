import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { courseId, method, email, emails } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: "Course ID required" }, { status: 400 })
    }

    if (method === "manual" && email) {
      const enrollment = {
        id: `enroll-${Date.now()}`,
        courseId,
        studentEmail: email,
        enrolledAt: new Date().toISOString(),
      }
      return NextResponse.json({ success: true, enrollment })
    }

    if (method === "bulk" && emails) {
      const enrollments = emails.map((e: string) => ({
        id: `enroll-${Date.now()}-${Math.random()}`,
        courseId,
        studentEmail: e,
        enrolledAt: new Date().toISOString(),
      }))
      return NextResponse.json({ success: true, enrollments, count: enrollments.length })
    }

    return NextResponse.json({ error: "Invalid enrollment method" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Enrollment error:", error)
    return NextResponse.json({ error: "Failed to enroll student" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const courseId = request.nextUrl.searchParams.get("courseId")

    const enrollments = [
      {
        id: "enroll-1",
        courseId,
        studentId: "STU001",
        studentName: "John Doe",
        email: "john@example.com",
        enrolledAt: "2024-11-01",
      },
      {
        id: "enroll-2",
        courseId,
        studentId: "STU002",
        studentName: "Jane Smith",
        email: "jane@example.com",
        enrolledAt: "2024-11-02",
      },
    ]

    return NextResponse.json({ success: true, enrollments })
  } catch (error) {
    console.error("[v0] Enrollment fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 })
  }
}
