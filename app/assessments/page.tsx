"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AssessmentForm } from "@/components/assessment-form"
import { GradingInterface } from "@/components/grading-interface"
import { BookOpen } from "lucide-react"

const mockAssessments = [
  {
    id: "1",
    title: "Midterm Exam",
    course: "Introduction to Biology",
    dueDate: "2024-11-15",
    totalPoints: 100,
    submissions: 28,
    graded: 15,
  },
  {
    id: "2",
    title: "Assignment 1",
    course: "Data Science 101",
    dueDate: "2024-11-10",
    totalPoints: 50,
    submissions: 32,
    graded: 32,
  },
]

const mockSubmissions = [
  {
    id: "s1",
    studentName: "John Doe",
    studentId: "STU001",
    submittedAt: "2024-11-09 14:30",
    status: "graded" as const,
    score: 85,
    totalPoints: 100,
  },
  {
    id: "s2",
    studentName: "Jane Smith",
    studentId: "STU002",
    submittedAt: "2024-11-09 15:45",
    status: "submitted" as const,
    totalPoints: 100,
  },
  {
    id: "s3",
    studentName: "Ahmed Hassan",
    studentId: "STU003",
    submittedAt: "2024-11-09 16:20",
    status: "submitted" as const,
    totalPoints: 100,
  },
]

export default function AssessmentsPage() {
  const [activeTab, setActiveTab] = useState("manage")
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assessments</h1>
        <p className="text-gray-600">Create and grade assignments, quizzes, and exams</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="grade">Grade</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockAssessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-lg transition">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{assessment.title}</CardTitle>
                      <CardDescription>{assessment.course}</CardDescription>
                    </div>
                    <BookOpen className="w-5 h-5 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-gray-600">Points</p>
                      <p className="font-semibold">{assessment.totalPoints}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-gray-600">Submitted</p>
                      <p className="font-semibold">{assessment.submissions}</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-gray-600">Graded</p>
                      <p className="font-semibold">{assessment.graded}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => {
                      setSelectedAssessment(assessment.id)
                      setActiveTab("grade")
                    }}
                  >
                    Grade Submissions
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create">
          <AssessmentForm courseId="course-1" onSubmit={(data) => console.log("[v0] Assessment created:", data)} />
        </TabsContent>

        <TabsContent value="grade">
          {selectedAssessment && <GradingInterface assessmentId={selectedAssessment} submissions={mockSubmissions} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
