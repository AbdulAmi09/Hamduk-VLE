import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const courseId = request.nextUrl.searchParams.get("courseId")

    const assessments = [
      {
        id: "assess-1",
        courseId,
        title: "Midterm Exam",
        totalPoints: 100,
        dueDate: "2024-11-15",
        submissions: 28,
        graded: 15,
      },
      {
        id: "assess-2",
        courseId,
        title: "Assignment 1",
        totalPoints: 50,
        dueDate: "2024-11-10",
        submissions: 32,
        graded: 32,
      },
    ]

    return NextResponse.json({ success: true, assessments })
  } catch (error) {
    console.error("[v0] Assessments fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { courseId, title, description, dueDate, totalPoints, questions } = await request.json()

    const newAssessment = {
      id: `assess-${Date.now()}`,
      courseId,
      title,
      description,
      dueDate,
      totalPoints,
      questions,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, assessment: newAssessment })
  } catch (error) {
    console.error("[v0] Assessment creation error:", error)
    return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 })
  }
}
