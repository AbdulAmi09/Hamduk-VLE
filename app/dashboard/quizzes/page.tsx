"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Edit2,
  Trash2,
  Play,
  Eye,
  Clock,
  BarChart3,
  Users,
} from "lucide-react"
import Link from "next/link"

interface Quiz {
  id: string
  title: string
  description: string
  class_id: string
  className: string
  created_by: string
  duration_minutes: number
  max_attempts: number
  pass_percentage: number
  show_results: boolean
  show_answers: boolean
  total_questions: number
  total_points: number
  status: "draft" | "active" | "closed"
  published_at: string
  created_at: string
}

export default function QuizzesPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [questionBanks, setQuestionBanks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classId: "",
    bankId: "",
    durationMinutes: 60,
    maxAttempts: 1,
    passPercentage: 60,
    showResults: true,
    showAnswers: false,
  })

  const role = user?.user_metadata?.role || "student"
  const isInstructor = ["tutor", "instructor", "school_admin", "platform_admin"].includes(role)

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      // Get user's classes
      const { data: classData } = await supabase
        .from("classes")
        .select("*")
        .eq("created_by", user?.id)
        .limit(50)
      setClasses(classData || [])

      // Get question banks
      const { data: banks } = await supabase
        .from("question_banks")
        .select("*")
        .eq("created_by", user?.id)
      setQuestionBanks(banks || [])

      // Get quizzes (for instructors) or their attempts (for students)
      if (isInstructor) {
        const { data: quizData } = await supabase
          .from("quizzes")
          .select("*")
          .eq("created_by", user?.id)
          .order("created_at", { ascending: false })

        if (quizData) {
          const enriched = await Promise.all(
            quizData.map(async (q: any) => {
              const cls = classData?.find((c) => c.id === q.class_id)
              return { ...q, className: cls?.title || "Unknown Class" }
            }),
          )
          setQuizzes(enriched || [])
        }
      }
    } catch (error) {
      console.error("[v0] Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.classId || !formData.bankId) {
      alert("Please select a class and question bank")
      return
    }

    try {
      // Get questions from bank
      const { data: questions } = await supabase
        .from("questions")
        .select("id, points")
        .eq("question_bank_id", formData.bankId)

      const totalPoints = questions?.reduce((sum, q) => sum + q.points, 0) || 0

      const quizData = {
        title: formData.title,
        description: formData.description,
        class_id: formData.classId,
        created_by: user?.id,
        question_bank_id: formData.bankId,
        duration_minutes: formData.durationMinutes,
        max_attempts: formData.maxAttempts,
        pass_percentage: formData.passPercentage,
        show_results: formData.showResults,
        show_answers: formData.showAnswers,
        total_questions: questions?.length || 0,
        total_points: totalPoints,
        status: "draft",
      }

      const { data, error } = await supabase.from("quizzes").insert(quizData).select().single()

      if (error) throw error

      const cls = classes.find((c) => c.id === formData.classId)
      setQuizzes([{ ...data, className: cls?.title || "Unknown Class" }, ...quizzes])

      setFormData({
        title: "",
        description: "",
        classId: "",
        bankId: "",
        durationMinutes: 60,
        maxAttempts: 1,
        passPercentage: 60,
        showResults: true,
        showAnswers: false,
      })
      setShowCreateModal(false)
      alert("Quiz created successfully!")
    } catch (error) {
      console.error("[v0] Error creating quiz:", error)
      alert("Failed to create quiz")
    }
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Delete this quiz?")) return

    try {
      await supabase.from("quizzes").delete().eq("id", quizId)
      setQuizzes(quizzes.filter((q) => q.id !== quizId))
    } catch (error) {
      console.error("[v0] Error deleting:", error)
      alert("Failed to delete quiz")
    }
  }

  const handlePublishQuiz = async (quizId: string) => {
    try {
      const { error } = await supabase
        .from("quizzes")
        .update({ status: "active", published_at: new Date().toISOString() })
        .eq("id", quizId)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error("[v0] Error publishing:", error)
      alert("Failed to publish quiz")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading quizzes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quizzes</h1>
          <p className="text-muted-foreground mt-1">
            {isInstructor
              ? "Create and manage quizzes"
              : "Take quizzes and track your progress"}
          </p>
        </div>

        {isInstructor && (
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Quiz</DialogTitle>
                <DialogDescription>
                  Select a class and question bank to create a quiz
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateQuiz} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Quiz Title *</label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Biology Mid-Term Quiz"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Class *</label>
                    <Select
                      value={formData.classId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, classId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Question Bank *</label>
                    <Select
                      value={formData.bankId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, bankId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {questionBanks.map((bank) => (
                          <SelectItem key={bank.id} value={bank.id}>
                            {bank.name} ({bank.total_questions}Q)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Duration (minutes)</label>
                    <Input
                      type="number"
                      value={formData.durationMinutes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          durationMinutes: parseInt(e.target.value),
                        })
                      }
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Max Attempts</label>
                    <Input
                      type="number"
                      value={formData.maxAttempts}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxAttempts: parseInt(e.target.value),
                        })
                      }
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Pass Percentage (%)</label>
                  <Input
                    type="number"
                    value={formData.passPercentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passPercentage: parseInt(e.target.value),
                      })
                    }
                    min="0"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.showResults}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          showResults: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm">Show results to students</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.showAnswers}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          showAnswers: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm">Show correct answers</span>
                  </label>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Quiz</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">
              {isInstructor ? "No quizzes created yet" : "No quizzes available"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle>{quiz.title}</CardTitle>
                    <CardDescription>{quiz.className}</CardDescription>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      quiz.status === "active"
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                    }`}
                  >
                    {quiz.status}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                {quiz.description && (
                  <p className="text-sm text-muted-foreground">{quiz.description}</p>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    {quiz.total_questions} questions
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {quiz.duration_minutes} min
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {quiz.max_attempts} attempt{quiz.max_attempts !== 1 ? "s" : ""}
                  </div>
                  <div className="text-muted-foreground">
                    Pass: {quiz.pass_percentage}%
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/dashboard/quizzes/${quiz.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </Link>

                  {isInstructor && (
                    <>
                      {quiz.status === "draft" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePublishQuiz(quiz.id)}
                          className="gap-2"
                        >
                          <Play className="h-4 w-4" />
                          Publish
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => handleDeleteQuiz(quiz.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
