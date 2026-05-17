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
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Eye,
  CheckCheck,
} from "lucide-react"
import Link from "next/link"

interface Assignment {
  id: string
  title: string
  description?: string
  class_id: string
  created_by: string
  due_date: string
  marks_available: number
  submission_type: string
  className?: string
  submission?: any
  submitted?: boolean
  graded?: boolean
}

export default function AssignmentsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [classes, setClasses] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classId: "",
    dueDate: "",
    marksAvailable: 100,
    submissionType: "both",
    allowLateSubmission: false,
    allowedFileTypes: ["pdf", "doc", "docx", "txt"],
  })

  const role = user?.user_metadata?.role || "student"
  const isInstructor = ["tutor", "instructor", "school_admin", "platform_admin"].includes(role)

  // Load assignments
  useEffect(() => {
    if (!user) return
    loadAssignments()
  }, [user])

  const loadAssignments = async () => {
    try {
      // Get user's classes
      const { data: classData } = await supabase
        .from("classes")
        .select("*")
        .or(`created_by.eq.${user?.id},id.in(${user?.id})`)
        .limit(100)

      setClasses(classData || [])

      // Get assignments
      const { data: assignmentData } = await supabase.from("assignments").select("*").limit(100)

      if (assignmentData) {
        // Enrich with class names and submission status
        const enriched = await Promise.all(
          assignmentData.map(async (a: any) => {
            const cls = classData?.find((c: any) => c.id === a.class_id)
            let submitted = false
            let graded = false
            let submission: any = null

            if (role === "student") {
              const { data: sub } = await supabase
                .from("assignment_submissions")
                .select("*, assignment_grades(*)")
                .eq("assignment_id", a.id)
                .eq("student_id", user?.id)
                .single()

              submission = sub
              submitted = !!sub
              graded = !!sub?.assignment_grades && sub.assignment_grades.length > 0
            }

            return {
              ...a,
              className: cls?.title || "Unknown Class",
              submitted,
              graded,
              submission,
            }
          }),
        )

        setAssignments(enriched)
      }
    } catch (error) {
      console.error("[v0] Failed to load assignments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data, error } = await supabase
        .from("assignments")
        .insert({
          title: formData.title,
          description: formData.description,
          class_id: formData.classId,
          created_by: user?.id,
          due_date: formData.dueDate,
          marks_available: formData.marksAvailable,
          submission_type: formData.submissionType,
          allow_late_submission: formData.allowLateSubmission,
          allowed_file_types: formData.allowedFileTypes,
        })
        .select()
        .single()

      if (error) throw error

      setAssignments([
        ...assignments,
        {
          ...data,
          className: classes.find((c) => c.id === formData.classId)?.title || "Unknown",
          submitted: false,
          graded: false,
        },
      ])

      setShowCreateModal(false)
      setFormData({
        title: "",
        description: "",
        classId: "",
        dueDate: "",
        marksAvailable: 100,
        submissionType: "both",
        allowLateSubmission: false,
        allowedFileTypes: ["pdf", "doc", "docx", "txt"],
      })
    } catch (error) {
      console.error("[v0] Error creating assignment:", error)
      alert("Failed to create assignment")
    }
  }

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return

    try {
      await supabase.from("assignments").delete().eq("id", id)
      setAssignments(assignments.filter((a) => a.id !== id))
    } catch (error) {
      console.error("[v0] Error deleting assignment:", error)
      alert("Failed to delete assignment")
    }
  }

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
  const pending = assignments.filter((a) => new Date(a.due_date) > now && !a.submitted)
  const submitted = assignments.filter((a) => a.submitted && !a.graded)
  const graded = assignments.filter((a) => a.graded)
  const overdue = assignments.filter((a) => new Date(a.due_date) <= now && !a.submitted)

  let filteredAssignments = assignments
  if (filter === "pending") filteredAssignments = pending
  else if (filter === "submitted") filteredAssignments = submitted
  else if (filter === "graded") filteredAssignments = graded
  else if (filter === "overdue") filteredAssignments = overdue

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-muted-foreground mt-1">
            {isInstructor
              ? "Create and manage assignments"
              : "View and submit your assignments"}
          </p>
        </div>

        {isInstructor && (
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
                <DialogDescription>
                  Create an assignment for your class
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Essay on Chapter 5"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Assignment details and requirements..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Class *</label>
                  <Select
                    value={formData.classId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, classId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Due Date *</label>
                    <Input
                      required
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Marks Available</label>
                    <Input
                      type="number"
                      value={formData.marksAvailable}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          marksAvailable: parseInt(e.target.value),
                        })
                      }
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Submission Type</label>
                  <Select
                    value={formData.submissionType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, submissionType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Only</SelectItem>
                      <SelectItem value="file">File Only</SelectItem>
                      <SelectItem value="both">Text & File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allowLate"
                    checked={formData.allowLateSubmission}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        allowLateSubmission: e.target.checked,
                      })
                    }
                  />
                  <label htmlFor="allowLate" className="text-sm">
                    Allow late submissions
                  </label>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Assignment</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {!isInstructor && (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pending.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Submitted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{submitted.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Graded
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {graded.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Overdue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {overdue.length}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filter Tabs (for students) */}
      {!isInstructor && (
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "submitted", label: "Submitted" },
            { key: "graded", label: "Graded" },
            { key: "overdue", label: "Overdue" },
          ].map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      )}

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No assignments</p>
            <p className="text-sm mt-2">
              {isInstructor
                ? "Create your first assignment to get started"
                : "No assignments for your classes yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map((assignment) => {
            const dueDate = new Date(assignment.due_date)
            const isOverdue = dueDate < now
            const daysUntilDue = Math.ceil(
              (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
            )

            return (
              <Card
                key={assignment.id}
                className={isOverdue ? "border-red-200 dark:border-red-900" : ""}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">
                          {assignment.title}
                        </h3>
                        {assignment.submitted && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                        {assignment.graded && (
                          <CheckCheck className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {assignment.className}
                      </p>
                      {assignment.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {assignment.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{assignment.marks_available} marks</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Link
                        href={`/dashboard/assignments/${assignment.id}`}
                      >
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          {assignment.submitted
                            ? "View Submission"
                            : "View Assignment"}
                        </Button>
                      </Link>

                      {isInstructor && (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDeleteAssignment(assignment.id)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      <div className="text-right">
                        {isOverdue && !assignment.submitted ? (
                          <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            Overdue
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <Clock className="h-4 w-4" />
                            {daysUntilDue > 0
                              ? `${daysUntilDue} days left`
                              : "Due soon"}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Due:{" "}
                          {dueDate.toLocaleDateString()}{" "}
                          {dueDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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
