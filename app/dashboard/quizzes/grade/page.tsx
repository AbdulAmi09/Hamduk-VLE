"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Save } from "lucide-react"

interface QuizAttempt {
  id: string
  quiz_id: string
  quiz_title: string
  student_name: string
  student_id: string
  submitted_at: string
  auto_graded_score: number
  total_points: number
}

interface Question {
  id: string
  question_text: string
  question_type: string
  points: number
}

interface Answer {
  id: string
  question_id: string
  student_answer: string
  is_correct?: boolean
  points_earned?: number
}

interface Grade {
  id?: string
  question_id: string
  marks_obtained: number
  feedback: string
}

export default function GradingPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const [quizzes, setQuizzes] = useState<any[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<string>("")
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [grades, setGrades] = useState<Record<string, Grade>>({})
  const [loading, setLoading] = useState(false)

  const role = user?.user_metadata?.role || "student"
  const isInstructor = ["tutor", "instructor", "school_admin", "platform_admin"].includes(role)

  useEffect(() => {
    if (!user || !isInstructor) return
    loadQuizzes()
  }, [user])

  const loadQuizzes = async () => {
    try {
      const { data } = await supabase
        .from("quizzes")
        .select("*")
        .eq("created_by", user?.id)
        .eq("status", "active")

      setQuizzes(data || [])
    } catch (error) {
      console.error("[v0] Error loading quizzes:", error)
    }
  }

  const handleSelectQuiz = async (quizId: string) => {
    setSelectedQuiz(quizId)
    setSelectedAttempt(null)
    setLoading(true)

    try {
      // Get submitted attempts for this quiz
      const { data: attemptsData } = await supabase
        .from("quiz_attempts")
        .select("*, profiles(full_name)")
        .eq("quiz_id", quizId)
        .not("submitted_at", "is", null)
        .order("submitted_at", { ascending: false })

      const formatted = attemptsData?.map((a: any) => ({
        ...a,
        student_name: a.profiles?.full_name || "Unknown",
      })) || []

      setAttempts(formatted)
    } catch (error) {
      console.error("[v0] Error loading attempts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAttempt = async (attempt: QuizAttempt) => {
    setSelectedAttempt(attempt)
    setLoading(true)

    try {
      // Get quiz details
      const { data: quizData } = await supabase
        .from("quizzes")
        .select("question_bank_id, total_points")
        .eq("id", attempt.quiz_id)
        .single()

      // Get questions
      const { data: questionsData } = await supabase
        .from("questions")
        .select("*")
        .eq("question_bank_id", quizData?.question_bank_id)

      setQuestions(questionsData || [])

      // Get student's answers
      const { data: answersData } = await supabase
        .from("quiz_answers")
        .select("*")
        .eq("attempt_id", attempt.id)

      const answersMap: Record<string, Answer> = {}
      answersData?.forEach((a: any) => {
        answersMap[a.question_id] = {
          id: a.id,
          question_id: a.question_id,
          student_answer: a.student_answer,
          is_correct: a.is_correct,
          points_earned: a.points_earned,
        }
      })
      setAnswers(answersMap)

      // Get existing grades
      const { data: gradesData } = await supabase
        .from("quiz_grades")
        .select("*")
        .eq("attempt_id", attempt.id)

      const gradesMap: Record<string, Grade> = {}
      gradesData?.forEach((g: any) => {
        gradesMap[g.question_id] = {
          id: g.id,
          question_id: g.question_id,
          marks_obtained: g.marks_obtained,
          feedback: g.feedback,
        }
      })
      setGrades(gradesMap)
    } catch (error) {
      console.error("[v0] Error loading attempt details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGrade = async (questionId: string) => {
    if (!selectedAttempt) return

    try {
      const grade = grades[questionId]
      const response = await fetch("/api/quizzes/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeId: grade?.id,
          attemptId: selectedAttempt.id,
          questionId,
          marksObtained: grade?.marks_obtained || 0,
          feedback: grade?.feedback || "",
        }),
      })

      if (!response.ok) throw new Error("Failed to save grade")
      alert("Grade saved successfully")
    } catch (error) {
      console.error("[v0] Error saving grade:", error)
      alert("Failed to save grade")
    }
  }

  if (!isInstructor) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Only instructors can grade</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Grade Submissions</h1>
        <p className="text-muted-foreground mt-1">Grade essay and short answer questions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar: Quiz and Attempt Selection */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Select Quiz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  onClick={() => handleSelectQuiz(quiz.id)}
                  className={`w-full text-left px-3 py-2 rounded-md transition ${
                    selectedQuiz === quiz.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary"
                  }`}
                >
                  <div className="font-medium text-sm truncate">{quiz.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {quiz.total_questions} questions
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {selectedQuiz && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Submissions</CardTitle>
                <CardDescription>
                  {attempts.length} to grade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                {attempts.map((attempt) => (
                  <button
                    key={attempt.id}
                    onClick={() => handleSelectAttempt(attempt)}
                    className={`w-full text-left px-3 py-2 rounded-md transition border ${
                      selectedAttempt?.id === attempt.id
                        ? "border-primary bg-primary/5"
                        : "border-secondary hover:border-primary/50"
                    }`}
                  >
                    <div className="font-medium text-sm">{attempt.student_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(attempt.auto_graded_score)}%
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main: Grading Interface */}
        <div className="lg:col-span-2">
          {!selectedAttempt ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground">
                  Select a quiz and submission to grade
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <Card>
                <CardHeader>
                  <CardTitle>{selectedAttempt.student_name}</CardTitle>
                  <CardDescription>
                    Submitted{" "}
                    {new Date(selectedAttempt.submitted_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Questions to Grade */}
              {questions.map((question) => {
                const answer = answers[question.id]
                const grade = grades[question.id]
                const needsGrading = ["short_answer", "essay"].includes(
                  question.question_type,
                )

                if (!needsGrading) return null

                return (
                  <Card key={question.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-base">
                            {question.question_text}
                          </CardTitle>
                          <Badge variant="outline" className="mt-2">
                            {question.question_type.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Out of
                          </p>
                          <p className="text-2xl font-bold">
                            {question.points}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Student's Answer */}
                      {answer && (
                        <div className="bg-secondary p-4 rounded-lg">
                          <p className="font-medium text-sm mb-2">
                            Student&apos;s Answer:
                          </p>
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {typeof answer.student_answer === "string"
                              ? answer.student_answer
                              : JSON.stringify(answer.student_answer)}
                          </p>
                        </div>
                      )}

                      {/* Grading Form */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">
                            Marks Obtained
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max={question.points}
                            value={grade?.marks_obtained || ""}
                            onChange={(e) =>
                              setGrades({
                                ...grades,
                                [question.id]: {
                                  ...grade,
                                  question_id: question.id,
                                  marks_obtained: parseFloat(
                                    e.target.value,
                                  ) || 0,
                                  feedback: grade?.feedback || "",
                                },
                              })
                            }
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            Feedback (Optional)
                          </label>
                          <Textarea
                            value={grade?.feedback || ""}
                            onChange={(e) =>
                              setGrades({
                                ...grades,
                                [question.id]: {
                                  ...grade,
                                  question_id: question.id,
                                  marks_obtained:
                                    grade?.marks_obtained || 0,
                                  feedback: e.target.value,
                                },
                              })
                            }
                            placeholder="Provide feedback for the student"
                            rows={3}
                          />
                        </div>

                        <Button
                          onClick={() => handleSaveGrade(question.id)}
                          className="w-full gap-2"
                        >
                          <Save className="h-4 w-4" />
                          Save Grade
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {/* Summary */}
              {questions.filter((q) =>
                ["short_answer", "essay"].includes(q.question_type),
              ).length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center py-8">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <p className="text-muted-foreground">
                      No essays or short answers to grade
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
