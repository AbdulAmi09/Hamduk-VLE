import { createClient } from "@/lib/supabase-server"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/quizzes/grade
 * Grade essay/short answer questions
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { gradeId, attemptId, questionId, marksObtained, feedback } =
      await request.json()

    // Verify instructor owns the quiz
    const { data: attempt } = await supabase
      .from("quiz_attempts")
      .select("quiz_id")
      .eq("id", attemptId)
      .single()

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
    }

    const { data: quiz } = await supabase
      .from("quizzes")
      .select("created_by")
      .eq("id", attempt.quiz_id)
      .single()

    if (quiz?.created_by !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Upsert grade
    const { data, error } = await supabase
      .from("quiz_grades")
      .upsert(
        {
          id: gradeId,
          attempt_id: attemptId,
          question_id: questionId,
          student_id: attempt.student_id,
          marks_obtained: marksObtained,
          feedback,
          graded_by: user.id,
          graded_at: new Date().toISOString(),
        },
        { onConflict: "attempt_id,question_id" },
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Grade error:", error)
    return NextResponse.json(
      { error: "Failed to save grade" },
      { status: 500 },
    )
  }
}

/**
 * GET /api/quizzes/grade
 * Get grades for quiz attempt
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const attemptId = request.nextUrl.searchParams.get("attemptId")

    if (!attemptId) {
      return NextResponse.json(
        { error: "Attempt ID required" },
        { status: 400 },
      )
    }

    // Get grades for this attempt
    const { data: grades, error } = await supabase
      .from("quiz_grades")
      .select("*")
      .eq("attempt_id", attemptId)

    if (error) throw error

    return NextResponse.json(grades)
  } catch (error) {
    console.error("[v0] Error fetching grades:", error)
    return NextResponse.json(
      { error: "Failed to fetch grades" },
      { status: 500 },
    )
  }
}
