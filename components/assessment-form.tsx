"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Plus, X } from "lucide-react"

interface Question {
  id: string
  text: string
  type: "multiple-choice" | "short-answer" | "essay"
  points: number
  options?: string[]
}

export function AssessmentForm({ courseId, onSubmit }: { courseId: string; onSubmit: (data: any) => void }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [totalPoints, setTotalPoints] = useState(100)
  const [questions, setQuestions] = useState<Question[]>([])
  const [newQuestion, setNewQuestion] = useState("")
  const [newQuestionType, setNewQuestionType] = useState<"multiple-choice" | "short-answer" | "essay">("short-answer")
  const [newQuestionPoints, setNewQuestionPoints] = useState(10)

  const addQuestion = () => {
    if (newQuestion.trim()) {
      const question: Question = {
        id: Date.now().toString(),
        text: newQuestion,
        type: newQuestionType,
        points: newQuestionPoints,
        options: newQuestionType === "multiple-choice" ? ["Option A", "Option B", "Option C", "Option D"] : undefined,
      }
      setQuestions([...questions, question])
      setNewQuestion("")
      setNewQuestionPoints(10)
    }
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title,
      description,
      dueDate,
      totalPoints,
      questions,
      courseId,
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Assessment</CardTitle>
        <CardDescription>Create assignments, quizzes, and exams for your course</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Assessment Title</Label>
            <Input
              id="title"
              placeholder="e.g., Midterm Exam, Assignment 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide instructions and context for students"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalPoints">Total Points</Label>
              <Input
                id="totalPoints"
                type="number"
                value={totalPoints}
                onChange={(e) => setTotalPoints(Number(e.target.value))}
                min={1}
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Questions</h3>

            {questions.length > 0 && (
              <div className="space-y-2">
                {questions.map((q) => (
                  <div key={q.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{q.text}</p>
                      <p className="text-xs text-gray-500">
                        {q.type} • {q.points} points
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="questionText">Question</Label>
                <Textarea
                  id="questionText"
                  placeholder="Enter question text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="questionType">Type</Label>
                  <select
                    id="questionType"
                    value={newQuestionType}
                    onChange={(e) => setNewQuestionType(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="short-answer">Short Answer</option>
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="essay">Essay</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="questionPoints">Points</Label>
                  <Input
                    id="questionPoints"
                    type="number"
                    value={newQuestionPoints}
                    onChange={(e) => setNewQuestionPoints(Number(e.target.value))}
                    min={1}
                  />
                </div>
              </div>

              <Button type="button" onClick={addQuestion} variant="outline" className="w-full bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Create Assessment
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
