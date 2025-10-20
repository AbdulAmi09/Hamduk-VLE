"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Users, FileText, BarChart3, Plus, Trash2 } from "lucide-react"

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const [students, setStudents] = useState([
    { id: "1", name: "Ahmed Hassan", email: "ahmed@example.com", status: "active", attendance: 92 },
    { id: "2", name: "Fatima Ali", email: "fatima@example.com", status: "active", attendance: 88 },
    { id: "3", name: "Mohammed Ibrahim", email: "mohammed@example.com", status: "active", attendance: 95 },
  ])

  const [lectures, setLectures] = useState([
    { id: "1", title: "Introduction to Data Structures", date: "2025-10-15", duration: 60, attended: 42 },
    { id: "2", title: "Arrays and Lists", date: "2025-10-22", duration: 75, attended: 39 },
  ])

  const [newStudentEmail, setNewStudentEmail] = useState("")

  const handleAddStudent = () => {
    if (newStudentEmail) {
      setStudents([
        ...students,
        {
          id: String(students.length + 1),
          name: "New Student",
          email: newStudentEmail,
          status: "active",
          attendance: 0,
        },
      ])
      setNewStudentEmail("")
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole="instructor" userName="Dr. Amina Hassan" />

      <main className="flex-1 md:ml-64">
        <Header title="CS101 - Introduction to Computer Science" subtitle="Course Management" />

        <div className="p-6 space-y-6">
          {/* Course Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Enrolled Students</p>
                    <p className="text-3xl font-bold text-gray-900">{students.length}</p>
                  </div>
                  <Users className="w-10 h-10 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Lectures</p>
                    <p className="text-3xl font-bold text-gray-900">{lectures.length}</p>
                  </div>
                  <FileText className="w-10 h-10 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg. Attendance</p>
                    <p className="text-3xl font-bold text-gray-900">91%</p>
                  </div>
                  <BarChart3 className="w-10 h-10 text-purple-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="students" className="space-y-4">
            <TabsList className="bg-white border border-gray-200">
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="lectures">Lectures</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Students</CardTitle>
                  <CardDescription>Add or remove students from this course</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter student email"
                      value={newStudentEmail}
                      onChange={(e) => setNewStudentEmail(e.target.value)}
                    />
                    <Button onClick={handleAddStudent} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                        <div className="text-right mr-4">
                          <p className="text-sm font-medium text-gray-900">{student.attendance}% attendance</p>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            {student.status}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setStudents(students.filter((s) => s.id !== student.id))}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Lectures Tab */}
            <TabsContent value="lectures" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Course Lectures</h3>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lecture
                </Button>
              </div>

              <div className="space-y-3">
                {lectures.map((lecture) => (
                  <Card key={lecture.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{lecture.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {lecture.date} • {lecture.duration} minutes
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{lecture.attended} attended</p>
                          <p className="text-xs text-gray-600">
                            {Math.round((lecture.attended / students.length) * 100)}% attendance
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Course Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Description</label>
                    <textarea
                      defaultValue="Fundamentals of programming and computer science concepts"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
