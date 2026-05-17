"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Eye, BarChart3 } from "lucide-react"
import Link from "next/link"

interface Attempt {
  id: string
  quiz_id: string
  quiz_title: string
  started_at: string
  submitted_at?: string
  auto_graded_score?: number
  time_spent_minutes?: number
  status: "in_progress" | "submitted"
}

export default function AttemptsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)

  const role = user?.user_metadata?.role || "student"
  const isStudent = role === "student"

  useEffect(() => {
    if (!user || !isStudent) return
    loadAttempts()
  }, [user])

  const loadAttempts = async () => {
    try {
      const { data } = await supabase
        .from("quiz_attempts")
        .select("*, quizzes(title)")
        .eq("student_id", user?.id)
        .order("started_at", { ascending: false })

      const formatted = data?.map((a: any) => ({
        ...a,
        quiz_title: a.quizzes.title,
        status: a.submitted_at ? "submitted" : "in_progress",
      })) || []

      setAttempts(formatted)
    } catch (error) {
      console.error("[v0] Error loading attempts:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isStudent) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">Only students can view attempt history</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading attempts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quiz Attempt History</h1>
        <p className="text-muted-foreground mt-1">View all your quiz attempts and results</p>
      </div>

      {attempts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No attempts yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {attempts.map((attempt) => (
            <Card key={attempt.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{attempt.quiz_title}</h3>
                      <Badge
                        variant={attempt.status === "submitted" ? "default" : "outline"}
                      >
                        {attempt.status === "submitted" ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Submitted
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            In Progress
                          </>
                        )}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground mt-3">
                      <div>
                        <p className="text-xs">Started</p>
                        <p className="font-medium">
                          {new Date(attempt.started_at).toLocaleDateString()}{" "}
                          {new Date(attempt.started_at).toLocaleTimeString()}
                        </p>
                      </div>

                      {attempt.submitted_at && (
                        <div>
                          <p className="text-xs">Submitted</p>
                          <p className="font-medium">
                            {new Date(attempt.submitted_at).toLocaleDateString()}{" "}
                            {new Date(attempt.submitted_at).toLocaleTimeString()}
                          </p>
                        </div>
                      )}

                      {attempt.time_spent_minutes && (
                        <div>
                          <p className="text-xs">Time Spent</p>
                          <p className="font-medium">
                            {attempt.time_spent_minutes} minute{attempt.time_spent_minutes !== 1 ? "s" : ""}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right space-y-3">
                    {attempt.auto_graded_score !== null && (
                      <div>
                        <p className="text-xs text-muted-foreground">Score</p>
                        <p className="text-2xl font-bold">
                          {Math.round(attempt.auto_graded_score || 0)}%
                        </p>
                      </div>
                    )}

                    <Link href={`/dashboard/quizzes/${attempt.quiz_id}`}>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Eye className="h-4 w-4" />
                        View Results
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
