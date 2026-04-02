"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlayCircle, CheckCircle, Clock, BookOpen, Plus, Download, Share2 } from "lucide-react"

interface Module {
  id: string
  title: string
  description?: string
  order_index?: number
  lessons?: Lesson[]
}

interface Lesson {
  id: string
  title: string
  description?: string
  video_url?: string
  duration_minutes?: number
  order_index?: number
  completed?: boolean
  watched_percentage?: number
}

export default function LessonsPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const classId = searchParams.get("classId") || ""
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [isTutorOrAdmin, setIsTutorOrAdmin] = useState(false)

  useEffect(() => {
    if (!user) return

    const role = user.user_metadata?.role || "student"
    setIsTutorOrAdmin(["tutor", "instructor", "school_admin"].includes(role))

    const loadModules = async () => {
      try {
        if (!classId) {
          setModules([])
          return
        }

        const res = await fetch(`/api/lessons?classId=${classId}`)
        if (!res.ok) throw new Error("Failed to load lessons")
        const data = await res.json()
        setModules(data.modules || [])

        // Select first lesson if available
        if (data.modules?.[0]?.lessons?.[0]) {
          setSelectedLesson(data.modules[0].lessons[0])
        }
      } catch (error) {
        console.error("[v0] Failed to load lessons:", error)
      } finally {
        setLoading(false)
      }
    }

    loadModules()
  }, [user, classId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading lessons...</p>
        </div>
      </div>
    )
  }

  if (!classId) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground py-12">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No class selected</p>
          <p className="text-sm mt-2">Please select a class to view lessons</p>
        </CardContent>
      </Card>
    )
  }

  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)
  const completedLessons = modules.reduce(
    (sum, m) => sum + (m.lessons?.filter((l) => l.completed).length || 0),
    0,
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Video Lessons</h1>
          <p className="text-muted-foreground mt-1">Learn at your own pace with course materials</p>
        </div>

        {isTutorOrAdmin && (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Lesson
          </Button>
        )}
      </div>

      {/* Progress Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Lessons</p>
              <p className="text-2xl font-bold mt-1">{totalLessons}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{completedLessons}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="text-2xl font-bold mt-1">{totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lessons View */}
      {modules.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground py-12">
            <PlayCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No lessons yet</p>
            <p className="text-sm mt-2">{isTutorOrAdmin ? "Create your first lesson to get started" : "Wait for content to be added"}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Modules Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-3">
              {modules.map((module) => (
                <div key={module.id} className="space-y-2">
                  <h3 className="font-semibold text-sm px-3 py-2">{module.title}</h3>
                  {module.lessons?.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        selectedLesson?.id === lesson.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {lesson.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <PlayCircle className="h-4 w-4" />
                      )}
                      <span className="text-sm flex-1 truncate">{lesson.title}</span>
                      {lesson.duration_minutes && (
                        <span className="text-xs opacity-70">{lesson.duration_minutes}min</span>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Video Player & Details */}
          <div className="lg:col-span-2 space-y-4">
            {selectedLesson ? (
              <>
                {/* Video Player */}
                <Card>
                  <CardContent className="pt-6">
                    {selectedLesson.video_url ? (
                      <div className="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                        <iframe
                          width="100%"
                          height="100%"
                          src={selectedLesson.video_url}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={selectedLesson.title}
                          className="rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="bg-muted rounded-lg h-96 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <PlayCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No video available</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Lesson Details */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedLesson.title}</CardTitle>
                        {selectedLesson.duration_minutes && (
                          <CardDescription className="flex items-center gap-1 mt-2">
                            <Clock className="h-4 w-4" />
                            {selectedLesson.duration_minutes} minutes
                          </CardDescription>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Share2 className="h-4 w-4" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {selectedLesson.description && (
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Overview</h4>
                        <p className="text-sm text-muted-foreground">{selectedLesson.description}</p>
                      </div>

                      {selectedLesson.watched_percentage ? (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Your Progress</h4>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${selectedLesson.watched_percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{selectedLesson.watched_percentage}% watched</p>
                        </div>
                      ) : null}

                      {!selectedLesson.completed && (
                        <Button className="w-full gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Mark as Complete
                        </Button>
                      )}
                    </CardContent>
                  )}
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground py-12">
                  <p>Select a lesson to view</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
