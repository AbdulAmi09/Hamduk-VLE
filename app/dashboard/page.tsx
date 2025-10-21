"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, FileText, BarChart3, Plus, Clock, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useCourses } from "@/hooks/use-courses"
import { useRealtime } from "@/hooks/use-realtime"

export default function Dashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { courses, loading: coursesLoading } = useCourses()
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const { data: attendanceData } = useRealtime("attendance", selectedCourseId)
  const { data: gradesData } = useRealtime("grades", selectedCourseId)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  if (authLoading || coursesLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const totalStudents = courses.reduce((sum, course: any) => sum + (course.active_students || 0), 0)
  const avgAttendance =
    attendanceData && Array.isArray(attendanceData)
      ? Math.round(
          attendanceData.reduce((sum: number, item: any) => sum + (item.attendance_rate || 0), 0) /
            attendanceData.length,
        )
      : 0
  const pendingSubmissions =
    gradesData && Array.isArray(gradesData)
      ? gradesData.reduce((sum: number, item: any) => sum + ((item.total_students || 0) - (item.graded || 0)), 0)
      : 0

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Sidebar */}
      <Sidebar
        userRole={user.user_metadata?.role || "student"}
        userName={user.user_metadata?.full_name || user.email || ""}
      />

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <Header title="Dashboard" subtitle="Welcome back to your learning hub" />

        <div className="p-6 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Active Courses"
              value={courses.length.toString()}
              icon={<BookOpen className="w-6 h-6" />}
              color="blue"
              trend={{ value: 0, isPositive: true }}
            />
            <StatCard
              label="Total Students"
              value={totalStudents.toString()}
              icon={<Users className="w-6 h-6" />}
              color="green"
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              label="Pending Submissions"
              value={pendingSubmissions.toString()}
              icon={<FileText className="w-6 h-6" />}
              color="orange"
              trend={{ value: 5, isPositive: false }}
            />
            <StatCard
              label="Avg. Attendance"
              value={`${avgAttendance}%`}
              icon={<BarChart3 className="w-6 h-6" />}
              color="purple"
              trend={{ value: 3, isPositive: true }}
            />
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="courses" className="space-y-4">
            <TabsList className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
              <TabsTrigger value="courses">My Courses</TabsTrigger>
              <TabsTrigger value="lectures">Upcoming Lectures</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Courses</h2>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Course
                </Button>
              </div>

              {courses.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-600 dark:text-gray-400">
                    No courses yet. Create your first course to get started.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map((course: any) => (
                    <Card
                      key={course.id}
                      className="hover:shadow-md transition-shadow cursor-pointer dark:bg-slate-800"
                      onClick={() => setSelectedCourseId(course.id)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{course.title}</CardTitle>
                            <CardDescription>{course.code}</CardDescription>
                          </div>
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-1 rounded">
                            Active
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" /> {course.active_students || 0} students
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" /> {course.total_lectures || 0} lectures
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Lectures Tab */}
            <TabsContent value="lectures" className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Lectures</h2>
              <div className="space-y-3">
                {courses.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center text-gray-600 dark:text-gray-400">
                      No lectures available. Create a course first.
                    </CardContent>
                  </Card>
                ) : (
                  courses.map((course: any) => (
                    <Card key={course.id} className="dark:bg-slate-800">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{course.code}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                              <Clock className="w-4 h-4" /> {course.start_date}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {course.total_lectures || 0} lectures
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Assignments Tab */}
            <TabsContent value="assignments" className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assignments</h2>
              <div className="space-y-3">
                {gradesData && Array.isArray(gradesData) && gradesData.length > 0 ? (
                  gradesData.map((assignment: any, idx: number) => (
                    <Card key={idx} className="dark:bg-slate-800">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{assignment.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{assignment.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">Due: {assignment.due_date}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {assignment.submitted}/{assignment.total_students} submitted
                            </p>
                            <div className="w-24 h-2 bg-gray-200 dark:bg-slate-700 rounded-full mt-2">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{
                                  width: `${assignment.total_students > 0 ? (assignment.submitted / assignment.total_students) * 100 : 0}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center text-gray-600 dark:text-gray-400">
                      No assignments yet.
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
              <div className="space-y-3">
                {[
                  {
                    action: "Student submitted assignment",
                    course: "Latest Course",
                    time: "2 hours ago",
                    icon: CheckCircle,
                  },
                  { action: "New enrollment", course: "Active Course", time: "5 hours ago", icon: Users },
                  {
                    action: "Lecture recorded successfully",
                    course: "Recent Lecture",
                    time: "1 day ago",
                    icon: FileText,
                  },
                ].map((activity, idx) => {
                  const Icon = activity.icon
                  return (
                    <Card key={idx} className="dark:bg-slate-800">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
                            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{activity.action}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{activity.course}</p>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-500">{activity.time}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
