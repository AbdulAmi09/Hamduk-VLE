"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { dbUtils } from "@/lib/db-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, CheckCircle, AlertCircle, FileText } from "lucide-react"

export default function AssignmentsPage() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "submitted" | "graded">("all")

  useEffect(() => {
    if (!user) return

    const loadAssignments = async () => {
      try {
        // Get user's classes
        const userClasses = await dbUtils.getUserClasses(user.id, user.user_metadata?.role || "student")

        // Get all assignments
        let allAssignments: any[] = []
        for (const cls of userClasses) {
          const classAssignments = await dbUtils.getAssignmentsByClass(cls.id)
          allAssignments.push(
            ...classAssignments.map((a: any) => ({
              ...a,
              className: cls.title,
              classId: cls.id,
            })),
          )
        }

        setAssignments(allAssignments)
      } catch (error) {
        console.error("[v0] Failed to load assignments:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAssignments()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading assignments...</p>
        </div>
      </div>
    )
  }

  const now = new Date()
  const pending = assignments.filter((a) => new Date(a.due_date) > now)
  const overdue = assignments.filter((a) => new Date(a.due_date) <= now)

  const filteredAssignments =
    filter === "pending"
      ? pending
      : filter === "overdue"
        ? overdue
        : assignments

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Assignments</h1>
        <p className="text-muted-foreground mt-1">Track your assignment deadlines and submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdue.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No assignments yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map((assignment) => {
            const dueDate = new Date(assignment.due_date)
            const isOverdue = dueDate < now
            const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

            return (
              <Card key={assignment.id} className={isOverdue ? "border-red-200 dark:border-red-900" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{assignment.className}</p>
                      {assignment.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{assignment.description}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Button variant="outline" size="sm">
                        View Assignment
                      </Button>

                      <div className="text-right">
                        {isOverdue ? (
                          <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            Overdue
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <Clock className="h-4 w-4" />
                            {daysUntilDue} days left
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
