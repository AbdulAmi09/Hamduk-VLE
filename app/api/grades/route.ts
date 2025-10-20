import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { submissionId, score, feedback } = await request.json()

    if (!submissionId || score === undefined) {
      return NextResponse.json({ error: "Submission ID and score required" }, { status: 400 })
    }

    const grade = {
      id: `grade-${Date.now()}`,
      submissionId,
      score,
      feedback,
      gradedAt: new Date().toISOString(),
    }

    console.log("[v0] Grade submitted:", grade)

    return NextResponse.json({ success: true, grade })
  } catch (error) {
    console.error("[v0] Grade submission error:", error)
    return NextResponse.json({ error: "Failed to submit grade" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const studentId = request.nextUrl.searchParams.get("studentId")

    const grades = [
      {
        id: "grade-1",
        studentId,
        assessmentTitle: "Midterm Exam",
        score: 85,
        totalPoints: 100,
        feedback: "Great work! Well done on the exam.",
        gradedAt: "2024-11-09T10:30:00Z",
      },
      {
        id: "grade-2",
        studentId,
        assessmentTitle: "Assignment 1",
        score: 45,
        totalPoints: 50,
        feedback: "Good effort. Review the concepts covered in lectures 3-5.",
        gradedAt: "2024-11-08T14:15:00Z",
      },
    ]

    return NextResponse.json({ success: true, grades })
  } catch (error) {
    console.error("[v0] Grades fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 })
  }
}
