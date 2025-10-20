"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { CourseCard } from "@/components/course-card"
import { CourseForm, type CourseData } from "@/components/course-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function CoursesPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CourseData | null>(null)
  const [courses, setCourses] = useState([
    {
      code: "CS101",
      title: "Introduction to Computer Science",
      description: "Fundamentals of programming and computer science concepts",
      students: 45,
      lectures: 12,
      startDate: "2025-09-01",
      endDate: "2025-12-15",
    },
    {
      code: "MATH201",
      title: "Calculus II",
      description: "Advanced calculus topics including integration and series",
      students: 38,
      lectures: 15,
      startDate: "2025-09-01",
      endDate: "2025-12-15",
    },
  ])

  const handleCreateCourse = (data: CourseData) => {
    if (editingCourse) {
      setCourses(courses.map((c) => (c.code === editingCourse.code ? data : c)))
      setEditingCourse(null)
    } else {
      setCourses([...courses, { ...data, students: 0, lectures: 0 }])
    }
    setShowForm(false)
  }

  const handleDeleteCourse = (code: string) => {
    setCourses(courses.filter((c) => c.code !== code))
  }

  const handleEditCourse = (course: CourseData) => {
    setEditingCourse(course)
    setShowForm(true)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole="instructor" userName="Dr. Amina Hassan" />

      <main className="flex-1 md:ml-64">
        <Header title="Course Management" subtitle="Create and manage your courses" />

        <div className="p-6 space-y-6">
          {showForm ? (
            <CourseForm
              onSubmit={handleCreateCourse}
              onCancel={() => {
                setShowForm(false)
                setEditingCourse(null)
              }}
              initialData={editingCourse || undefined}
            />
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">My Courses ({courses.length})</h2>
                <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Course
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <CourseCard
                    key={course.code}
                    {...course}
                    onEdit={() => handleEditCourse(course)}
                    onDelete={() => handleDeleteCourse(course.code)}
                    onManage={() => console.log("Manage course:", course.code)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
