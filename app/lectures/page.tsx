"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Play, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function LecturesPage() {
  const [userRole] = useState<"student" | "instructor">("student")

  const upcomingLectures = [
    {
      id: "1",
      title: "Data Structures: Arrays and Lists",
      course: "CS101",
      date: "2025-10-22",
      time: "10:00 AM",
      duration: 75,
      isMandatory: true,
      status: "upcoming",
    },
    {
      id: "2",
      title: "Integration Techniques",
      course: "MATH201",
      date: "2025-10-23",
      time: "2:00 PM",
      duration: 60,
      isMandatory: false,
      status: "upcoming",
    },
  ]

  const completedLectures = [
    {
      id: "3",
      title: "Introduction to Programming",
      course: "CS101",
      date: "2025-10-15",
      duration: 90,
      watched: 100,
      attended: true,
    },
    {
      id: "4",
      title: "Limits and Continuity",
      course: "MATH201",
      date: "2025-10-16",
      duration: 75,
      watched: 85,
      attended: true,
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole={userRole} userName="Ahmed Hassan" />

      <main className="flex-1 md:ml-64">
        <Header title="Lectures" subtitle="View and manage your course lectures" />

        <div className="p-6 space-y-6">
          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList className="bg-white border border-gray-200">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="mandatory">Mandatory</TabsTrigger>
            </TabsList>

            {/* Upcoming Lectures */}
            <TabsContent value="upcoming" className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Lectures</h2>
              <div className="space-y-3">
                {upcomingLectures.map((lecture) => (
                  <Card key={lecture.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{lecture.title}</h3>
                            {lecture.isMandatory && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                                Mandatory
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{lecture.course}</p>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {lecture.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {lecture.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {lecture.duration} min
                            </div>
                          </div>
                        </div>

                        <Link href={`/lectures/${lecture.id}`}>
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            <Play className="w-4 h-4 mr-2" />
                            Watch
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Completed Lectures */}
            <TabsContent value="completed" className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Completed Lectures</h2>
              <div className="space-y-3">
                {completedLectures.map((lecture) => (
                  <Card key={lecture.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{lecture.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{lecture.course}</p>

                          <div className="mt-3 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Watch Progress</span>
                              <span className="font-medium text-gray-900">{lecture.watched}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500" style={{ width: `${lecture.watched}%` }} />
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          {lecture.attended && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                              Attended
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Mandatory Lectures */}
            <TabsContent value="mandatory" className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Mandatory Lectures</h2>
              <div className="space-y-3">
                {upcomingLectures
                  .filter((l) => l.isMandatory)
                  .map((lecture) => (
                    <Card key={lecture.id} className="border-red-200 bg-red-50">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="w-5 h-5 text-red-600" />
                              <h3 className="font-semibold text-gray-900">{lecture.title}</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{lecture.course}</p>
                            <p className="text-sm text-red-700 font-medium">
                              You must attend this lecture to mark attendance
                            </p>
                          </div>

                          <Link href={`/lectures/${lecture.id}`}>
                            <Button className="bg-red-600 hover:bg-red-700">
                              <Play className="w-4 h-4 mr-2" />
                              Watch Now
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
