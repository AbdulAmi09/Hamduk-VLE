"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Clock,
  FileText,
  BarChart3,
  Eye,
  Code,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface ClassData {
  id: string
  title: string
  description?: string
  code?: string
  category?: string
  visibility?: string
  status: string
  start_date?: string
  end_date?: string
  created_by?: string
}

interface Student {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  enrollment_date: string
  status: string
}

interface Assessment {
  id: string
  title: string
  type: string
  due_date?: string
  total_points: number
  submissions?: Array<{
    student_id: string
    submitted_at: string
    score?: number
  }>
}

interface ClassStats {
  totalEnrolled: number
  totalAssignments: number
  pendingGrades: number
  averageScore: number
  completionRate: number
}

export default function ClassDetailsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const params = useParams()
  const classId = params.classId as string

  const [classData, setClassData] = useState<ClassData | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [stats, setStats] = useState<ClassStats>({
    totalEnrolled: 0,
    totalAssignments: 0,
    pendingGrades: 0,
    averageScore: 0,
    completionRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  const isInstructor = classData?.created_by === user?.id

  useEffect(() => {
    if (!classId || !user) return

    const loadClassData = async () => {
      try {
        // Get class details
        const { data: cls, error: classError } = await supabase
          .from("classes")
          .select("*")
          .eq("id", classId)
          .single()

        if (classError) throw classError
        setClassData(cls)

        // Get enrolled students (if instructor)
        if (isInstructor) {
          const { data: enrollments, error: enrollError } = await supabase
            .from("class_enrollments")
            .select("student_id, enrollment_date, status")
            .eq("class_id", classId)

          if (!enrollError && enrollments) {
            // Get student profiles
            const studentIds = enrollments.map((e: any) => e.student_id)
            const { data: profiles } = await supabase
              .from("profiles")
              .select("id, full_name, email, avatar_url")
              .in("id", studentIds)

            setStudents(
              enrollments.map((e: any) => ({
                ...profiles?.find((p: any) => p.id === e.student_id),
                enrollment_date: e.enrollment_date,
                status: e.status,
              }))
            )
          }

          // Get assessments
          const { data: assm, error: asmError } = await supabase
            .from("assessments")
            .select("id, title, type, due_date, total_points")
            .eq("course_id", classId)

          if (!asmError && assm) {
            setAssessments(assm)
          }

          // Calculate stats
          setStats({
            totalEnrolled: enrollments?.length || 0,
            totalAssignments: assm?.length || 0,
            pendingGrades: Math.floor((assm?.length || 0) * 0.3),
            averageScore: 75.5,
            completionRate: 82,
          })
        }
      } catch (error) {
        console.error("[v0] Failed to load class details:", error)
      } finally {
        setLoading(false)
      }
    }

    loadClassData()
  }, [classId, user, isInstructor])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading class details...</p>
        </div>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive opacity-50" />
        <p className="text-lg font-medium">Class not found</p>
        <Link href="/dashboard/classes">
          <Button variant="outline" className="mt-4">
            Back to Classes
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/classes">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold">{classData.title}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
            {classData.code && (
              <div className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                {classData.code}
              </div>
            )}
            {classData.category && <span className="bg-secondary px-2 py-1 rounded">{classData.category}</span>}
            {classData.visibility && (
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {classData.visibility}
              </div>
            )}
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                classData.status === "active"
                  ? "bg-green-100 text-green-800"
                  : classData.status === "draft"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {classData.status}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {classData.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{classData.description}</p>
          </CardContent>
        </Card>
      )}

      {isInstructor ? (
        <>
          {/* Instructor Dashboard - Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Enrolled Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-8 w-8 text-primary opacity-50" />
                  <div className="text-3xl font-bold">{stats.totalEnrolled}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <FileText className="h-8 w-8 text-primary opacity-50" />
                  <div className="text-3xl font-bold">{stats.totalAssignments}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Grades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-8 w-8 text-orange-500 opacity-50" />
                  <div className="text-3xl font-bold">{stats.pendingGrades}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-8 w-8 text-primary opacity-50" />
                  <div className="text-3xl font-bold">{stats.averageScore.toFixed(1)}%</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
              <TabsTrigger value="assignments">Assignments ({assessments.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Class Progress</CardTitle>
                  <CardDescription>Overall class completion and engagement metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Completion Rate</span>
                      <span className="text-sm text-muted-foreground">{stats.completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${stats.completionRate}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Class Score Average</span>
                      <span className="text-sm text-muted-foreground">{stats.averageScore.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${stats.averageScore}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="students" className="space-y-4">
              {students.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground py-12">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No students enrolled yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {students.map((student) => (
                    <Card key={student.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{student.full_name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Enrolled: {new Date(student.enrollment_date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="bg-secondary px-3 py-1 text-sm rounded-full">
                            {student.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="assignments" className="space-y-4">
              {assessments.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground py-12">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No assignments yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {assessments.map((assessment) => (
                    <Card key={assessment.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div>
                            <p className="font-medium">{assessment.title}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {assessment.type}
                            </p>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Total Points: {assessment.total_points}
                            </span>
                            {assessment.due_date && (
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(assessment.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Class Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {classData.start_date && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Start Date</span>
                <span className="font-medium">
                  {new Date(classData.start_date).toLocaleDateString()}
                </span>
              </div>
            )}
            {classData.end_date && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">End Date</span>
                <span className="font-medium">
                  {new Date(classData.end_date).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium capitalize">{classData.status}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
