import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { lectureId, studentId, watchPercentage, duration } = await request.json()

    if (!lectureId || !studentId) {
      return NextResponse.json({ error: "Lecture ID and Student ID required" }, { status: 400 })
    }

    const attendance = {
      id: `attendance-${Date.now()}`,
      lectureId,
      studentId,
      watchPercentage,
      duration,
      marked: watchPercentage >= 75,
      timestamp: new Date().toISOString(),
    }

    console.log("[v0] Attendance recorded:", attendance)

    return NextResponse.json({ success: true, attendance })
  } catch (error) {
    console.error("[v0] Attendance error:", error)
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const lectureId = request.nextUrl.searchParams.get("lectureId")

    const attendanceRecords = [
      {
        id: "att-1",
        lectureId,
        studentId: "STU001",
        studentName: "John Doe",
        watchPercentage: 95,
        marked: true,
        timestamp: "2024-11-09T14:30:00Z",
      },
      {
        id: "att-2",
        lectureId,
        studentId: "STU002",
        studentName: "Jane Smith",
        watchPercentage: 60,
        marked: false,
        timestamp: "2024-11-09T15:45:00Z",
      },
    ]

    return NextResponse.json({ success: true, attendance: attendanceRecords })
  } catch (error) {
    console.error("[v0] Attendance fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}
