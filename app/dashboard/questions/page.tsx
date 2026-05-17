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
import { Plus, Edit2, Trash2, Search, BookOpen, Tag, Zap } from "lucide-react"

interface Question {
  id: string
  question_text: string
  question_type: string
  difficulty_level: string
  points: number
  question_bank_id: string
  options?: any
  correct_answer?: any
  explanation?: string
  tags?: string[]
}

interface QuestionBank {
  id: string
  name: string
  description: string
  total_questions: number
  subject_area: string
  difficulty_level: string
}

export default function QuestionsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedBank, setSelectedBank] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showBankModal, setShowBankModal] = useState(false)
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

  const [bankForm, setBankForm] = useState({ name: "", description: "", subject_area: "", difficulty_level: "mixed" })
  const [questionForm, setQuestionForm] = useState({
    question_text: "",
    question_type: "mcq",
    difficulty_level: "medium",
    points: 1,
    options: ["", "", "", ""],
    correct_answer: 0,
    explanation: "",
  })

  const role = user?.user_metadata?.role || "student"
  const isInstructor = ["tutor", "instructor", "school_admin", "platform_admin"].includes(role)

  useEffect(() => {
    if (!user || !isInstructor) return
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      const { data: banks } = await supabase.from("question_banks").select("*").eq("created_by", user?.id)
      setQuestionBanks(banks || [])

      if (banks && banks.length > 0) {
        setSelectedBank(banks[0].id)
        const { data: qs } = await supabase.from("questions").select("*").eq("question_bank_id", banks[0].id)
        setQuestions(qs || [])
      }
    } catch (error) {
      console.error("[v0] Error loading questions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from("question_banks")
        .insert({
          ...bankForm,
          created_by: user?.id,
          total_questions: 0,
        })
        .select()
        .single()

      if (error) throw error
      setQuestionBanks([...questionBanks, data])
      setSelectedBank(data.id)
      setBankForm({ name: "", description: "", subject_area: "", difficulty_level: "mixed" })
      setShowBankModal(false)
    } catch (error) {
      console.error("[v0] Error creating bank:", error)
      alert("Failed to create question bank")
    }
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBank) {
      alert("Select a question bank first")
      return
    }

    try {
      const questionData = {
        question_bank_id: selectedBank,
        question_text: questionForm.question_text,
        question_type: questionForm.question_type,
        difficulty_level: questionForm.difficulty_level,
        points: questionForm.points,
        explanation: questionForm.explanation,
        ...(questionForm.question_type === "mcq" && {
          options: questionForm.options,
          correct_answer: questionForm.correct_answer,
        }),
        ...(questionForm.question_type === "true_false" && {
          correct_answer: questionForm.correct_answer === 0 ? "true" : "false",
        }),
      }

      if (editingQuestion) {
        const { data, error } = await supabase
          .from("questions")
          .update(questionData)
          .eq("id", editingQuestion.id)
          .select()
          .single()

        if (error) throw error
        setQuestions(questions.map((q) => (q.id === editingQuestion.id ? data : q)))
      } else {
        const { data, error } = await supabase.from("questions").insert(questionData).select().single()

        if (error) throw error
        setQuestions([...questions, data])
      }

      setQuestionForm({
        question_text: "",
        question_type: "mcq",
        difficulty_level: "medium",
        points: 1,
        options: ["", "", "", ""],
        correct_answer: 0,
        explanation: "",
      })
      setEditingQuestion(null)
      setShowQuestionModal(false)
    } catch (error) {
      console.error("[v0] Error saving question:", error)
      alert("Failed to save question")
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Delete this question?")) return

    try {
      await supabase.from("questions").delete().eq("id", questionId)
      setQuestions(questions.filter((q) => q.id !== questionId))
    } catch (error) {
      console.error("[v0] Error deleting:", error)
      alert("Failed to delete question")
    }
  }

  const handleSelectBank = async (bankId: string) => {
    setSelectedBank(bankId)
    const { data } = await supabase.from("questions").select("*").eq("question_bank_id", bankId)
    setQuestions(data || [])
  }

  if (!isInstructor) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">Only instructors can manage questions</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const filteredQuestions = questions.filter((q) =>
    q.question_text.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Question Bank</h1>
          <p className="text-muted-foreground mt-1">Create and manage question banks</p>
        </div>

        <Dialog open={showBankModal} onOpenChange={setShowBankModal}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Question Bank
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Question Bank</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateBank} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  required
                  value={bankForm.name}
                  onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })}
                  placeholder="e.g., Biology Chapter 5"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={bankForm.description}
                  onChange={(e) => setBankForm({ ...bankForm, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    value={bankForm.subject_area}
                    onChange={(e) => setBankForm({ ...bankForm, subject_area: e.target.value })}
                    placeholder="e.g., Biology"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select
                    value={bankForm.difficulty_level}
                    onValueChange={(value) => setBankForm({ ...bankForm, difficulty_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowBankModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Bank</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Question Banks Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your Banks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {questionBanks.map((bank) => (
              <button
                key={bank.id}
                onClick={() => handleSelectBank(bank.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition ${
                  selectedBank === bank.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                }`}
              >
                <div className="font-medium text-sm">{bank.name}</div>
                <div className="text-xs text-muted-foreground">{bank.total_questions} questions</div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="lg:col-span-3 space-y-4">
          {selectedBank && (
            <>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search questions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Dialog open={showQuestionModal} onOpenChange={setShowQuestionModal}>
                  <DialogTrigger asChild>
                    <Button
                      className="gap-2"
                      onClick={() => {
                        setEditingQuestion(null)
                        setQuestionForm({
                          question_text: "",
                          question_type: "mcq",
                          difficulty_level: "medium",
                          points: 1,
                          options: ["", "", "", ""],
                          correct_answer: 0,
                          explanation: "",
                        })
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingQuestion ? "Edit Question" : "Add Question"}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleAddQuestion} className="space-y-4 max-h-[70vh] overflow-y-auto">
                      <div>
                        <label className="text-sm font-medium">Question *</label>
                        <Textarea
                          required
                          value={questionForm.question_text}
                          onChange={(e) =>
                            setQuestionForm({ ...questionForm, question_text: e.target.value })
                          }
                          placeholder="Enter your question"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium">Type</label>
                          <Select
                            value={questionForm.question_type}
                            onValueChange={(value) =>
                              setQuestionForm({ ...questionForm, question_type: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mcq">Multiple Choice</SelectItem>
                              <SelectItem value="true_false">True/False</SelectItem>
                              <SelectItem value="short_answer">Short Answer</SelectItem>
                              <SelectItem value="essay">Essay</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Difficulty</label>
                          <Select
                            value={questionForm.difficulty_level}
                            onValueChange={(value) =>
                              setQuestionForm({ ...questionForm, difficulty_level: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Points</label>
                          <Input
                            type="number"
                            value={questionForm.points}
                            onChange={(e) =>
                              setQuestionForm({
                                ...questionForm,
                                points: parseInt(e.target.value),
                              })
                            }
                            min="1"
                          />
                        </div>
                      </div>

                      {["mcq", "true_false"].includes(questionForm.question_type) && (
                        <div>
                          <label className="text-sm font-medium mb-2">
                            {questionForm.question_type === "mcq" ? "Options" : "Choose Correct"}
                          </label>
                          <div className="space-y-2">
                            {questionForm.question_type === "mcq"
                              ? questionForm.options.map((option, idx) => (
                                  <div key={idx} className="flex gap-2">
                                    <Input
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...questionForm.options]
                                        newOptions[idx] = e.target.value
                                        setQuestionForm({ ...questionForm, options: newOptions })
                                      }}
                                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setQuestionForm({
                                          ...questionForm,
                                          correct_answer: idx,
                                        })
                                      }
                                      className={`px-3 py-2 rounded text-sm font-medium ${
                                        questionForm.correct_answer === idx
                                          ? "bg-green-500 text-white"
                                          : "bg-secondary"
                                      }`}
                                    >
                                      {questionForm.correct_answer === idx ? "✓" : ""}
                                    </button>
                                  </div>
                                ))
                              : ["True", "False"].map((option, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() =>
                                      setQuestionForm({
                                        ...questionForm,
                                        correct_answer: idx,
                                      })
                                    }
                                    className={`w-full px-3 py-2 rounded font-medium text-sm ${
                                      questionForm.correct_answer === idx
                                        ? "bg-green-500 text-white"
                                        : "bg-secondary"
                                    }`}
                                  >
                                    {option} {questionForm.correct_answer === idx ? "✓" : ""}
                                  </button>
                                ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium">Explanation (Optional)</label>
                        <Textarea
                          value={questionForm.explanation}
                          onChange={(e) =>
                            setQuestionForm({ ...questionForm, explanation: e.target.value })
                          }
                          placeholder="Explain the correct answer"
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => setShowQuestionModal(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingQuestion ? "Update" : "Add"} Question
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {filteredQuestions.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No questions yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {filteredQuestions.map((question) => (
                    <Card key={question.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium">{question.question_text}</p>
                              <div className="flex gap-2 mt-2">
                                <span className="text-xs bg-secondary px-2 py-1 rounded">
                                  {question.question_type.replace("_", " ")}
                                </span>
                                <span className="text-xs bg-secondary px-2 py-1 rounded">
                                  {question.difficulty_level}
                                </span>
                                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                  {question.points} pts
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingQuestion(question)
                                  setQuestionForm({
                                    question_text: question.question_text,
                                    question_type: question.question_type,
                                    difficulty_level: question.difficulty_level,
                                    points: question.points,
                                    options: question.options || ["", "", "", ""],
                                    correct_answer: 0,
                                    explanation: question.explanation || "",
                                  })
                                  setShowQuestionModal(true)
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive"
                                onClick={() => handleDeleteQuestion(question.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {question.explanation && (
                            <div className="bg-secondary p-3 rounded text-sm">
                              <p className="font-medium mb-1">Explanation:</p>
                              <p className="text-muted-foreground">{question.explanation}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
