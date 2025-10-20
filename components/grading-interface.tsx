"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, FileText } from "lucide-react"

interface Submission {
  id: string
  studentName: string
  studentId: string
  submittedAt: string
  status: "submitted" | "graded" | "pending"
  score?: number
  totalPoints: number
}

export function GradingInterface({ assessmentId, submissions }: { assessmentId: string; submissions: Submission[] }) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(submissions[0] || null)
  const [score, setScore] = useState(selectedSubmission?.score || 0)
  const [feedback, setFeedback] = useState("")

  const handleGradeSubmission = () => {
    console.log("[v0] Grading submission:", { assessmentId, submissionId: selectedSubmission?.id, score, feedback })
    // API call would go here
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "graded":
        return "bg-green-100 text-green-800"
      case "submitted":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Submissions List */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Submissions</CardTitle>
          <CardDescription>{submissions.length} total</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {submissions.map((submission) => (
            <button
              key={submission.id}
              onClick={() => {
                setSelectedSubmission(submission)
                setScore(submission.score || 0)
                setFeedback("")
              }}
              className={`w-full text-left p-3 rounded-lg border-2 transition ${
                selectedSubmission?.id === submission.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="font-medium text-sm">{submission.studentName}</p>
              <p className="text-xs text-gray-500">{submission.studentId}</p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(submission.status)}`}>
                  {submission.status}
                </span>
                {submission.score !== undefined && (
                  <span className="text-xs font-semibold">
                    {submission.score}/{submission.totalPoints}
                  </span>
                )}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Grading Panel */}
      {selectedSubmission && (
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedSubmission.studentName}</CardTitle>
                <CardDescription>Submitted {selectedSubmission.submittedAt}</CardDescription>
              </div>
              {selectedSubmission.status === "graded" && <CheckCircle className="w-6 h-6 text-green-500" />}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Submission Content */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-sm">Submission Content</span>
              </div>
              <div className="p-3 bg-white rounded border text-sm text-gray-700 max-h-64 overflow-y-auto">
                <p>
                  Student submission content would be displayed here. This could include text answers, uploaded files,
                  or code submissions.
                </p>
              </div>
            </div>

            {/* Scoring */}
            <div className="space-y-3 border-t pt-4">
              <Label htmlFor="score">Score</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="score"
                  type="number"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  min={0}
                  max={selectedSubmission.totalPoints}
                  className="flex-1"
                />
                <span className="text-sm font-medium">/ {selectedSubmission.totalPoints}</span>
              </div>
            </div>

            {/* Feedback */}
            <div className="space-y-3">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Provide constructive feedback for the student"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
            </div>

            <Button onClick={handleGradeSubmission} className="w-full">
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Grade
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
