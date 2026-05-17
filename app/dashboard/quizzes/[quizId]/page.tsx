"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase-client"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Send,
  CheckCircle,
  XCircle,
} from "lucide-react"
import Link from "next/link"

interface Quiz {
  id: string
  title: string
  description: string
  duration_minutes: number
  max_attempts: number
  pass_percentage: number
  show_results: boolean
  show_answers: boolean
  total_questions: number
  total_points: number
  status: string
  question_bank_id: string
}

interface Question {
  id: string
  question_text: string
  question_type: string
  points: number
  options?: any
  correct_answer?: any
  explanation?: string
}

interface QuizAttempt {
  id: string
  student_id: string
  started_at: string
  submitted_at?: string
  score?: number
  auto_graded_score?: number
  time_spent_minutes?: number
}

export default function QuizPlayerPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const params = useParams()
  const quizId = params.quizId as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [showResults, setShowResults] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [passed, setPassed] = useState(false)

  const [timeLeft, setTimeLeft] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const role = user?.user_metadata?.role || "student"
  const isStudent = role === "student"

  useEffect(() => {
    if (!quizId || !user) return
    loadQuiz()
  }, [quizId, user])

  // Timer countdown
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timerActive, timeLeft])

  const loadQuiz = async () => {
    try {
      // Load quiz
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .single()

      if (quizError) throw quizError
      setQuiz(quizData)

      // Load questions from the question bank
      const { data: questionsData } = await supabase
        .from("questions")
        .select("*")
        .eq("question_bank_id", quizData.question_bank_id)
        .order("id")

      setQuestions(questionsData || [])

      // Check if student has already started
      if (isStudent && user?.id) {
        const { data: attempts } = await supabase
          .from("quiz_attempts")
          .select("*")
          .eq("quiz_id", quizId)
          .eq("student_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)

        if (attempts && attempts.length > 0) {
          setCurrentAttempt(attempts[0])
          if (attempts[0].submitted_at) {
            setShowResults(true)
            setScore(attempts[0].auto_graded_score || 0)
            setPassed((attempts[0].auto_graded_score || 0) >= quizData.pass_percentage)
          } else {
            // Resume quiz
            setTimeLeft(quizData.duration_minutes * 60)
            setTimerActive(true)
          }
        }
      }
    } catch (error) {
      console.error("[v0] Error loading quiz:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .insert({
          quiz_id: quizId,
          student_id: user?.id,
          started_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      setCurrentAttempt(data)
      setTimeLeft(quiz!.duration_minutes * 60)
      setTimerActive(true)
    } catch (error) {
      console.error("[v0] Error starting quiz:", error)
      alert("Failed to start quiz")
    }
  }

  const handleAnswerQuestion = (questionId: string, answer: any) => {
    setAnswers({ ...answers, [questionId]: answer })
  }

  const handleSubmitQuiz = async () => {
    if (!currentAttempt || !quiz) return

    try {
      let autoGradedScore = 0

      // Auto-grade MCQ and True/False
      for (const question of questions) {
        const studentAnswer = answers[question.id]
        if (!studentAnswer) continue

        if (
          question.question_type === "mcq" ||
          question.question_type === "true_false"
        ) {
          if (
            studentAnswer === question.correct_answer ||
            studentAnswer.toString() === question.correct_answer?.toString()
          ) {
            autoGradedScore += question.points
          }
        }
      }

      const percentageScore = (autoGradedScore / quiz.total_points) * 100

      // Save attempt and answers
      await supabase.from("quiz_attempts").update({
        submitted_at: new Date().toISOString(),
        auto_graded_score: percentageScore,
        time_spent_minutes: Math.round(
          (quiz.duration_minutes * 60 - timeLeft) / 60,
        ),
      }).eq("id", currentAttempt.id)

      // Save answers
      for (const [questionId, answer] of Object.entries(answers)) {
        const question = questions.find((q) => q.id === questionId)
        const isCorrect =
          question &&
          (question.question_type === "mcq" ||
            question.question_type === "true_false") &&
          (answer === question.correct_answer ||
            answer.toString() === question.correct_answer?.toString())

        await supabase.from("quiz_answers").insert({
          attempt_id: currentAttempt.id,
          question_id: questionId,
          student_answer: answer,
          is_correct: isCorrect || false,
          points_earned: isCorrect ? question?.points || 0 : 0,
        })
      }

      setSubmitted(true)
      setShowResults(true)
      setScore(percentageScore)
      setPassed(percentageScore >= (quiz.pass_percentage || 60))
      setTimerActive(false)
    } catch (error) {
      console.error("[v0] Error submitting:", error)
      alert("Failed to submit quiz")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">Quiz not found</p>
        </CardContent>
      </Card>
    )
  }

  if (!currentAttempt && !showResults) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/dashboard/quizzes">
          <Button variant="outline" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Quizzes
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {quiz.description && (
              <p className="text-muted-foreground">{quiz.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Questions</p>
                <p className="text-2xl font-bold">{quiz.total_questions}</p>
              </div>
              <div className="bg-secondary p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Time Limit</p>
                <p className="text-2xl font-bold">{quiz.duration_minutes} min</p>
              </div>
              <div className="bg-secondary p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold">{quiz.total_points}</p>
              </div>
              <div className="bg-secondary p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Pass Score</p>
                <p className="text-2xl font-bold">{quiz.pass_percentage}%</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium mb-3">Instructions:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• You have {quiz.duration_minutes} minutes to complete this quiz</li>
                <li>• You can retake this quiz up to {quiz.max_attempts} time(s)</li>
                <li>• {quiz.show_results ? "Your results will be shown" : "Results are hidden"} after submission</li>
                {quiz.show_answers && <li>• Correct answers will be displayed</li>}
              </ul>
            </div>

            <Button onClick={handleStartQuiz} size="lg" className="w-full gap-2">
              <Play className="h-5 w-5" />
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showResults && quiz.show_results) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/dashboard/quizzes">
          <Button variant="outline" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Quizzes
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{quiz.title} - Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                {passed ? (
                  <CheckCircle className="h-16 w-16 text-green-600" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-600" />
                )}
              </div>

              <div>
                <p className="text-4xl font-bold">{Math.round(score || 0)}%</p>
                <p className="text-lg font-medium text-muted-foreground mt-2">
                  {passed ? "PASSED" : "FAILED"}
                </p>
              </div>

              <div className="bg-secondary p-4 rounded-lg text-sm text-muted-foreground">
                <p>
                  You need {quiz.pass_percentage}% to pass this quiz
                </p>
              </div>
            </div>

            {quiz.show_answers && (
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-medium">Review Answers:</h3>
                {questions.map((question) => {
                  const studentAnswer = answers[question.id]
                  const isCorrect =
                    question.question_type === "mcq" ||
                    question.question_type === "true_false"
                      ? studentAnswer === question.correct_answer
                      : false

                  return (
                    <div
                      key={question.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <p className="font-medium">{question.question_text}</p>
                      <p
                        className={`text-sm ${
                          isCorrect
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        Your answer:{" "}
                        {studentAnswer || "Not answered"}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-blue-600">
                          Correct answer:{" "}
                          {question.correct_answer}
                        </p>
                      )}
                      {question.explanation && (
                        <p className="text-sm text-muted-foreground pt-2">
                          {question.explanation}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentAttempt) return null

  const currentQuestion = questions[currentQuestionIdx]
  const progress = ((currentQuestionIdx + 1) / questions.length) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Timer */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{quiz.title}</h2>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIdx + 1} of {questions.length}
              </p>
            </div>

            <div
              className={`text-center px-4 py-3 rounded-lg font-bold text-lg ${
                timeLeft < 300
                  ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                  : "bg-secondary"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </div>
            </div>
          </div>

          <Progress value={progress} className="mt-4" />
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{currentQuestion.question_text}</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {currentQuestion.points} point{currentQuestion.points !== 1 ? "s" : ""}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {currentQuestion.question_type === "mcq" && (
            <div className="space-y-2">
              {currentQuestion.options?.map((option: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() =>
                    handleAnswerQuestion(currentQuestion.id, idx)
                  }
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    answers[currentQuestion.id] === idx
                      ? "border-primary bg-primary/5"
                      : "border-secondary hover:border-primary/50"
                  }`}
                >
                  <span className="font-medium">
                    {String.fromCharCode(65 + idx)}.
                  </span>{" "}
                  {option}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.question_type === "true_false" && (
            <div className="grid grid-cols-2 gap-4">
              {["True", "False"].map((option, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    handleAnswerQuestion(
                      currentQuestion.id,
                      idx === 0 ? "true" : "false",
                    )
                  }
                  className={`p-4 rounded-lg border-2 font-medium transition ${
                    (answers[currentQuestion.id] === "true" && idx === 0) ||
                    (answers[currentQuestion.id] === "false" && idx === 1)
                      ? "border-primary bg-primary/5"
                      : "border-secondary hover:border-primary/50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {["short_answer", "essay"].includes(
            currentQuestion.question_type,
          ) && (
            <textarea
              value={answers[currentQuestion.id] || ""}
              onChange={(e) =>
                handleAnswerQuestion(currentQuestion.id, e.target.value)
              }
              placeholder={
                currentQuestion.question_type === "essay"
                  ? "Write your essay here..."
                  : "Write your answer here..."
              }
              className="w-full p-3 border rounded-lg min-h-[150px]"
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-2 justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
          disabled={currentQuestionIdx === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestionIdx < questions.length - 1 && (
            <Button
              variant="outline"
              onClick={() =>
                setCurrentQuestionIdx(
                  Math.min(questions.length - 1, currentQuestionIdx + 1),
                )
              }
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {currentQuestionIdx === questions.length - 1 && (
            <Button
              onClick={handleSubmitQuiz}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Submit Quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
