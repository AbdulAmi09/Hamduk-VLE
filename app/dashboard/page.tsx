"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, FileText, BarChart3, Plus, Clock, CheckCircle } from "lucide-react"

export default function Dashboard() {
  const [userRole] = useState<"instructor" | "student">("instructor")
  const userName = "Dr. Amina Hassan"

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar userRole={userRole} userName={userName} />

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <Header title="Dashboard" subtitle="Welcome back to your learning hub" />

        <div className="p-6 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Active Courses"
              value="2"
              icon={<BookOpen className="w-6 h-6" />}
              color="blue"
              trend={{ value: 0, isPositive: true }}
            />
            <StatCard
              label="Total Students"
              value="83"
              icon={<Users className="w-6 h-6" />}
              color="green"
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              label="Pending Submissions"
              value="23"
              icon={<FileText className="w-6 h-6" />}
              color="orange"
              trend={{ value: 5, isPositive: false }}
            />
            <StatCard
              label="Avg. Attendance"
              value="87%"
              icon={<BarChart3 className="w-6 h-6" />}
              color="purple"
              trend={{ value: 3, isPositive: true }}
            />
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="courses" className="space-y-4">
            <TabsList className="bg-white border border-gray-200">
              <TabsTrigger value="courses">My Courses</TabsTrigger>
              <TabsTrigger value="lectures">Upcoming Lectures</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Course
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { code: "CS101", title: "Introduction to Computer Science", students: 45, lectures: 12 },
                  { code: "MATH201", title: "Calculus II", students: 38, lectures: 15 },
                ].map((course) => (
                  <Card key={course.code} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <CardDescription>{course.code}</CardDescription>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Active</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" /> {course.students} students
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" /> {course.lectures} lectures
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Lectures Tab */}
            <TabsContent value="lectures" className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Lectures</h2>
              <div className="space-y-3">
                {[
                  { title: "Data Structures", course: "CS101", date: "Oct 22, 2025", time: "10:00 AM", students: 45 },
                  {
                    title: "Integration Techniques",
                    course: "MATH201",
                    date: "Oct 23, 2025",
                    time: "2:00 PM",
                    students: 38,
                  },
                ].map((lecture, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{lecture.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{lecture.course}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {lecture.date}
                          </p>
                          <p className="text-sm text-gray-600">{lecture.time}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Assignments Tab */}
            <TabsContent value="assignments" className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Assignments</h2>
              <div className="space-y-3">
                {[
                  { title: "Assignment 1: Arrays", course: "CS101", dueDate: "Oct 25, 2025", submitted: 32, total: 45 },
                  { title: "Problem Set 5", course: "MATH201", dueDate: "Oct 26, 2025", submitted: 28, total: 38 },
                ].map((assignment, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{assignment.course}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">Due: {assignment.dueDate}</p>
                          <p className="text-sm text-gray-600">
                            {assignment.submitted}/{assignment.total} submitted
                          </p>
                          <div className="w-24 h-2 bg-gray-200 rounded-full mt-2">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${(assignment.submitted / assignment.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <div className="space-y-3">
                {[
                  { action: "Student submitted assignment", course: "CS101", time: "2 hours ago", icon: CheckCircle },
                  { action: "New enrollment in MATH201", course: "MATH201", time: "5 hours ago", icon: Users },
                  { action: "Lecture recorded successfully", course: "CS101", time: "1 day ago", icon: FileText },
                ].map((activity, idx) => {
                  const Icon = activity.icon
                  return (
                    <Card key={idx}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-600">{activity.course}</p>
                          </div>
                          <p className="text-sm text-gray-500">{activity.time}</p>
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
