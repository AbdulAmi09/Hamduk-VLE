import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Mock course data - replace with real DB query
    const courses = [
      {
        id: "course-1",
        title: "Introduction to Biology",
        description: "Learn the fundamentals of biology",
        instructor: "Dr. Smith",
        students: 28,
        lectures: 10,
      },
      {
        id: "course-2",
        title: "Data Science 101",
        description: "Introduction to data science and analytics",
        instructor: "Prof. Johnson",
        students: 32,
        lectures: 12,
      },
    ]

    return NextResponse.json({ success: true, courses })
  } catch (error) {
    console.error("[v0] Courses fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, instructorId } = await request.json()

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description required" }, { status: 400 })
    }

    const newCourse = {
      id: `course-${Date.now()}`,
      title,
      description,
      instructorId,
      createdAt: new Date().toISOString(),
      students: 0,
      lectures: 0,
    }

    return NextResponse.json({ success: true, course: newCourse })
  } catch (error) {
    console.error("[v0] Course creation error:", error)
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}
