import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const courseId = request.nextUrl.searchParams.get("courseId")

    const lectures = [
      {
        id: "lecture-1",
        courseId,
        title: "Cell Structure and Function",
        videoUrl: "https://example.com/video1.mp4",
        duration: 3600,
        mandatory: true,
        createdAt: "2024-11-01",
      },
      {
        id: "lecture-2",
        courseId,
        title: "Photosynthesis",
        videoUrl: "https://example.com/video2.mp4",
        duration: 2700,
        mandatory: false,
        createdAt: "2024-11-05",
      },
    ]

    return NextResponse.json({ success: true, lectures })
  } catch (error) {
    console.error("[v0] Lectures fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch lectures" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { courseId, title, videoUrl, duration, mandatory } = await request.json()

    const newLecture = {
      id: `lecture-${Date.now()}`,
      courseId,
      title,
      videoUrl,
      duration,
      mandatory,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, lecture: newLecture })
  } catch (error) {
    console.error("[v0] Lecture creation error:", error)
    return NextResponse.json({ error: "Failed to create lecture" }, { status: 500 })
  }
}
