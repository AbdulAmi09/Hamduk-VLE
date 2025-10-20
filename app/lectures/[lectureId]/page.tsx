"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { VideoPlayer } from "@/components/video-player"
import { AttendanceMarker } from "@/components/attendance-marker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, FileText } from "lucide-react"

export default function LectureDetailPage({ params }: { params: { lectureId: string } }) {
  const [watchedPercentage, setWatchedPercentage] = useState(0)
  const [userRole] = useState<"student" | "instructor">("student")

  // Mock lecture data
  const lecture = {
    id: params.lectureId,
    title: "Data Structures: Arrays and Lists",
    course: "CS101 - Introduction to Computer Science",
    description:
      "In this lecture, we explore fundamental data structures including arrays and linked lists. We'll discuss their properties, use cases, and implementation details.",
    videoUrl: "/lecture-video-player.jpg",
    duration: 75,
    scheduledDate: "2025-10-22",
    scheduledTime: "10:00 AM",
    isMandatory: true,
    instructor: "Dr. Amina Hassan",
    attendees: 42,
    totalStudents: 45,
  }

  const handleWatchProgress = (watchedMinutes: number) => {
    const percentage = (watchedMinutes / lecture.duration) * 100
    setWatchedPercentage(Math.min(percentage, 100))
  }

  const handleMarkAttendance = (lectureId: string, attended: boolean) => {
    console.log("[v0] Attendance marked:", { lectureId, attended })
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole={userRole} userName="Ahmed Hassan" />

      <main className="flex-1 md:ml-64">
        <Header title={lecture.course} subtitle="Lecture Details" />

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Player */}
              <VideoPlayer
                videoUrl={lecture.videoUrl}
                title={lecture.title}
                duration={lecture.duration}
                onWatchProgress={handleWatchProgress}
                isMandatory={lecture.isMandatory}
              />

              {/* Lecture Details */}
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-white border border-gray-200">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="discussion">Discussion</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Lecture Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700">{lecture.description}</p>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-600">Scheduled</p>
                            <p className="font-medium text-gray-900">
                              {lecture.scheduledDate} at {lecture.scheduledTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-xs text-gray-600">Attendance</p>
                            <p className="font-medium text-gray-900">
                              {lecture.attendees}/{lecture.totalStudents} students
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="resources" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Lecture Resources</CardTitle>
                      <CardDescription>Materials related to this lecture</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { name: "Lecture Slides", type: "PDF", size: "2.4 MB" },
                        { name: "Code Examples", type: "ZIP", size: "1.8 MB" },
                        { name: "Reading List", type: "PDF", size: "0.9 MB" },
                      ].map((resource, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-900">{resource.name}</p>
                              <p className="text-xs text-gray-600">
                                {resource.type} • {resource.size}
                              </p>
                            </div>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">Download</button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="discussion" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Discussion Forum</CardTitle>
                      <CardDescription>Ask questions and discuss the lecture content</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-center py-8">No discussions yet. Be the first to start!</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Attendance Marker */}
              {userRole === "student" && (
                <AttendanceMarker
                  lectureId={lecture.id}
                  studentId="student-1"
                  isMandatory={lecture.isMandatory}
                  watchedPercentage={watchedPercentage}
                  onMarkAttendance={handleMarkAttendance}
                />
              )}

              {/* Lecture Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Lecture Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Instructor</p>
                    <p className="font-medium text-gray-900">{lecture.instructor}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-medium text-gray-900">{lecture.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Course</p>
                    <p className="font-medium text-gray-900">{lecture.course}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
