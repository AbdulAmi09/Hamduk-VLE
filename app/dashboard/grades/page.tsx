"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { dbUtils } from "@/lib/db-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp } from "lucide-react"

interface Grade {
  id: string
  class_id: string
  assessment_id: string
  score: number
  percentage: number
  final_grade: string
}

export default function GradesPage() {
  const { user } = useAuth()
  const [grades, setGrades] = useState<Grade[]>([])
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        const userClasses = await dbUtils.getUserClasses(user.id, user.user_metadata?.role || "student")
        setClasses(userClasses || [])

        if (userClasses && userClasses.length > 0) {
          setSelectedClass(userClasses[0].id)
        }
      } catch (error) {
        console.error("[v0] Failed to load classes:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  useEffect(() => {
    if (!selectedClass || !user) return

    const loadGrades = async () => {
      try {
        const classGrades = await dbUtils.getStudentGrades(user.id, selectedClass)
        setGrades(classGrades || [])
      } catch (error) {
        console.error("[v0] Failed to load grades:", error)
      }
    }

    loadGrades()
  }, [selectedClass, user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading grades...</p>
        </div>
      </div>
    )
  }

  const totalGrade =
    grades.length > 0
      ? Math.round(grades.reduce((sum: number, g: any) => sum + (g.percentage || 0), 0) / grades.length)
      : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Grades</h1>
        <p className="text-muted-foreground mt-1">View your course grades and performance</p>
      </div>

      {/* Class Selection & Overall Stats */}
      {classes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Select Class</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls.id)}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                      selectedClass === cls.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {cls.title}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Average
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalGrade}%</div>
              <p className="text-xs text-muted-foreground mt-1">Course average</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Grades</CardTitle>
          <CardDescription>Your grades for all assessments in this class</CardDescription>
        </CardHeader>
        <CardContent>
          {grades.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No grades yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Assessment</th>
                    <th className="text-right py-3 px-4 font-medium">Score</th>
                    <th className="text-right py-3 px-4 font-medium">Percentage</th>
                    <th className="text-right py-3 px-4 font-medium">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr key={grade.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">Assessment {grade.assessment_id.slice(0, 8)}</td>
                      <td className="text-right py-3 px-4 font-medium">{grade.score}</td>
                      <td className="text-right py-3 px-4">
                        <span className={`${
                          grade.percentage >= 80
                            ? "text-green-600 dark:text-green-400"
                            : grade.percentage >= 60
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400"
                        }`}>
                          {grade.percentage}%
                        </span>
                      </td>
                      <td className="text-right py-3 px-4 font-bold">{grade.final_grade || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
