"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, Send, CheckCircle, AlertCircle, Clock } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface Assignment {
  id: string
  title: string
  description: string
  due_date: string
  marks_available: number
  submission_type: string
  created_by: string
  class_id: string
  instructions?: string
}

interface Submission {
  id: string
  student_id: string
  submission_text?: string
  file_url?: string
  submitted_at: string
  is_late: boolean
  assignment_grades?: Array<{
    marks_obtained: number
    feedback: string
    graded_at: string
  }>
}

export default function AssignmentDetailPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const params = useParams()
  const assignmentId = params.assignmentId as string

  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [submissionText, setSubmissionText] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [gradeData, setGradeData] = useState({ marks: "", feedback: "" })
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null)

  const role = user?.user_metadata?.role || "student"
  const isInstructor = ["tutor", "instructor", "school_admin", "platform_admin"].includes(role)

  useEffect(() => {
    if (!assignmentId || !user) return
    loadData()
  }, [assignmentId, user])

  const loadData = async () => {
    try {
      const { data: assignmentData, error: assignmentError } = await supabase
        .from("assignments")
        .select("*")
        .eq("id", assignmentId)
        .single()

      if (assignmentError) throw assignmentError
      setAssignment(assignmentData)

      if (isInstructor) {
        const { data: submissionsData } = await supabase
          .from("assignment_submissions")
          .select("*, assignment_grades(*)")
          .eq("assignment_id", assignmentId)

        setSubmissions(submissionsData || [])
      } else {
        const { data: submissionData } = await supabase
          .from("assignment_submissions")
          .select("*, assignment_grades(*)")
          .eq("assignment_id", assignmentId)
          .eq("student_id", user?.id)
          .single()

        setSubmission(submissionData || null)
      }
    } catch (error) {
      console.error("[v0] Error loading assignment:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!submissionText.trim() && !selectedFile) {
      alert("Please provide text or file")
      return
    }

    setSubmitting(true)

    try {
      let fileUrl = null

      if (selectedFile) {
        const fileName = `${assignmentId}/${user?.id}/${Date.now()}_${selectedFile.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("submissions")
          .upload(fileName, selectedFile)

        if (uploadError) throw uploadError
        fileUrl = uploadData.path
      }

      const isLate = new Date() > new Date(assignment!.due_date)

      const { data: subData, error: subError } = await supabase
        .from("assignment_submissions")
        .upsert(
          {
            assignment_id: assignmentId,
            student_id: user?.id,
            submission_text: submissionText || null,
            file_url: fileUrl,
            submitted_at: new Date().toISOString(),
            is_late: isLate,
            status: "submitted",
          },
          { onConflict: "assignment_id,student_id" },
        )
        .select("*, assignment_grades(*)")
        .single()

      if (subError) throw subError

      setSubmission(subData)
      setSubmissionText("")
      setSelectedFile(null)
      alert("Submission successful!")
    } catch (error) {
      console.error("[v0] Error submitting:", error)
      alert("Failed to submit assignment")
    } finally {
      setSubmitting(false)
    }
  }

  const handleGradeSubmission = async (submissionId: string) => {
    if (!gradeData.marks) {
      alert("Please enter marks")
      return
    }

    try {
      const { error } = await supabase
        .from("assignment_grades")
        .upsert(
          {
            submission_id: submissionId,
            assignment_id: assignmentId,
            student_id: submissions.find((s) => s.id === submissionId)?.student_id,
            marks_obtained: parseFloat(gradeData.marks),
            feedback: gradeData.feedback,
            graded_at: new Date().toISOString(),
            graded_by: user?.id,
          },
          { onConflict: "submission_id" },
        )
        .select()

      if (error) throw error

      await loadData()
      setGradingSubmissionId(null)
      setGradeData({ marks: "", feedback: "" })
      alert("Grade recorded successfully!")
    } catch (error) {
      console.error("[v0] Error grading:", error)
      alert("Failed to grade submission")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading assignment...</p>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/assignments">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Assignments
          </Button>
        </Link>
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">Assignment not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const dueDate = new Date(assignment.due_date)
  const now = new Date()
  const isOverdue = dueDate < now
  const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      <Link href="/dashboard/assignments">
        <Button variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Assignments
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{assignment.title}</CardTitle>
              <CardDescription className="mt-2">
                {assignment.marks_available} marks • {assignment.submission_type} submission
              </CardDescription>
            </div>

            <div className="text-right">
              {isOverdue ? (
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Overdue</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{daysLeft} days left</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Due: {dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {assignment.instructions && (
            <div>
              <h4 className="font-medium mb-2">Instructions</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {assignment.instructions}
              </p>
            </div>
          )}

          {assignment.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{assignment.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {!isInstructor && (
        <div className="space-y-4">
          {submission ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Your Submission
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Submitted: {new Date(submission.submitted_at).toLocaleString()}
                  </p>
                  {submission.is_late && (
                    <p className="text-sm text-red-600 mt-1">Late submission</p>
                  )}
                </div>

                {submission.submission_text && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Text Submission</h4>
                    <p className="text-sm text-muted-foreground p-3 bg-secondary rounded">
                      {submission.submission_text}
                    </p>
                  </div>
                )}

                {submission.file_url && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Submitted File</h4>
                    <a href={submission.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Download File
                      </Button>
                    </a>
                  </div>
                )}

                {submission.assignment_grades && submission.assignment_grades.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-sm mb-3">Grade & Feedback</h4>
                    {submission.assignment_grades.map((grade) => (
                      <div key={grade.graded_at}>
                        <p className="text-lg font-bold text-green-600">
                          {grade.marks_obtained} / {assignment.marks_available} marks
                        </p>
                        {grade.feedback && (
                          <div className="mt-3">
                            <p className="text-sm font-medium mb-1">Feedback:</p>
                            <p className="text-sm text-muted-foreground">
                              {grade.feedback}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Graded: {new Date(grade.graded_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Work</CardTitle>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {["text", "both"].includes(assignment.submission_type) && (
                    <div>
                      <label className="text-sm font-medium">Answer</label>
                      <Textarea
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        placeholder="Type your answer here..."
                        rows={5}
                      />
                    </div>
                  )}

                  {["file", "both"].includes(assignment.submission_type) && (
                    <div>
                      <label className="text-sm font-medium">Upload File</label>
                      <Input
                        type="file"
                        onChange={(e) =>
                          setSelectedFile(e.target.files?.[0] || null)
                        }
                      />
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Selected: {selectedFile.name}
                        </p>
                      )}
                    </div>
                  )}

                  <Button type="submit" disabled={submitting} className="gap-2">
                    <Send className="h-4 w-4" />
                    {submitting ? "Submitting..." : "Submit Assignment"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {isInstructor && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Submissions ({submissions.length})</h2>

          {submissions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground">No submissions yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <Card key={sub.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">
                            Student {sub.student_id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Submitted: {new Date(sub.submitted_at).toLocaleString()}
                          </p>
                          {sub.is_late && (
                            <p className="text-sm text-red-600 font-medium">
                              Late submission
                            </p>
                          )}
                        </div>

                        {sub.assignment_grades && sub.assignment_grades.length > 0 && (
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              {sub.assignment_grades[0].marks_obtained} /{" "}
                              {assignment.marks_available}
                            </p>
                            <p className="text-xs text-muted-foreground">Graded</p>
                          </div>
                        )}
                      </div>

                      {sub.submission_text && (
                        <div>
                          <p className="text-sm font-medium mb-1">Text Submission:</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {sub.submission_text}
                          </p>
                        </div>
                      )}

                      {sub.file_url && (
                        <a href={sub.file_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            <Upload className="h-4 w-4 mr-1" />
                            View File
                          </Button>
                        </a>
                      )}

                      {gradingSubmissionId === sub.id ? (
                        <div className="border-t pt-3 space-y-3">
                          <div>
                            <label className="text-sm font-medium">Marks</label>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                value={gradeData.marks}
                                onChange={(e) =>
                                  setGradeData({
                                    ...gradeData,
                                    marks: e.target.value,
                                  })
                                }
                                placeholder="0"
                                max={assignment.marks_available}
                              />
                              <span className="text-sm text-muted-foreground py-2">
                                / {assignment.marks_available}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium">Feedback</label>
                            <Textarea
                              value={gradeData.feedback}
                              onChange={(e) =>
                                setGradeData({
                                  ...gradeData,
                                  feedback: e.target.value,
                                })
                              }
                              placeholder="Provide feedback for the student..."
                              rows={3}
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleGradeSubmission(sub.id)
                              }
                            >
                              Save Grade
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setGradingSubmissionId(null)
                                setGradeData({ marks: "", feedback: "" })
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setGradingSubmissionId(sub.id)
                            if (sub.assignment_grades && sub.assignment_grades.length > 0) {
                              setGradeData({
                                marks: sub.assignment_grades[0].marks_obtained.toString(),
                                feedback: sub.assignment_grades[0].feedback || "",
                              })
                            }
                          }}
                        >
                          {sub.assignment_grades && sub.assignment_grades.length > 0
                            ? "Edit Grade"
                            : "Grade Submission"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
