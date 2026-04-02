"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Clock, CheckCircle2 } from "lucide-react"

interface Assessment {
  id: string
  title: string
  description: string
  type: "quiz" | "exam" | "test"
  class_id: string
  class_name: string
  due_date: string
  duration_minutes: number
  total_points: number
  status: "pending" | "completed" | "graded"
  score?: number
  percentage?: number
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "graded">("all")

  useEffect(() => {
    loadAssessments()
  }, [])

  const loadAssessments = async () => {
    try {
      const res = await fetch("/api/assessments")
      if (res.ok) {
        const data = await res.json()
        setAssessments(data.assessments || [])
      }
    } catch (error) {
      console.error("[v0] Error loading assessments:", error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = assessments.filter(
    (a) => filter === "all" || a.status === filter
  )

  const getTypeIcon = (type: string) => {
    return <FileText className="h-4 w-4" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "completed":
        return "bg-blue-500"
      case "graded":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const isDue = (dueDate: string) => new Date(dueDate) < new Date()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Assessments
        </h1>
        <p className="text-muted-foreground mt-2">Complete quizzes, exams, and tests</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "completed", "graded"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Assessments List */}
      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No {filter !== "all" ? filter : ""} assessments
            </CardContent>
          </Card>
        ) : (
          filtered.map((assessment) => (
            <Card key={assessment.id} className={isDue(assessment.due_date) && assessment.status === "pending" ? "border-red-500 border-2" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(assessment.type)}
                      <div>
                        <CardTitle>{assessment.title}</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {assessment.class_name}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(assessment.status)}`}>
                    {assessment.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{assessment.description}</p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Due Date</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className={isDue(assessment.due_date) && assessment.status === "pending" ? "text-red-500 font-semibold" : ""}>
                        {new Date(assessment.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Duration</p>
                    <p className="font-medium">{assessment.duration_minutes} minutes</p>
                  </div>
                </div>

                {assessment.status === "graded" && assessment.score !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Score</p>
                      <span className="font-bold text-lg">
                        {assessment.score}/{assessment.total_points}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${assessment.percentage || 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{assessment.percentage}%</p>
                  </div>
                )}

                {assessment.status === "pending" && (
                  <Button className="w-full">
                    Take Assessment
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
