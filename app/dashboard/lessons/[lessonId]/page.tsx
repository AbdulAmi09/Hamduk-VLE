"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  BookOpen,
  MessageSquare,
  Save,
  AlertCircle,
  Volume2,
  RotateCcw,
  Play,
  Pause,
  Maximize,
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface Lesson {
  id: string
  title: string
  description?: string
  video_url?: string
  duration_minutes?: number
  module_id: string
}

interface Module {
  id: string
  title: string
  order_index: number
  lessons?: Lesson[]
}

interface Note {
  id: string
  timestamp_seconds: number
  content: string
  created_at: string
}

interface LessonProgress {
  id: string
  progress_percentage: number
  completed: boolean
  last_accessed: string
  completed_at?: string
}

export default function LessonPlayerPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const lessonId = params.lessonId as string
  const supabase = createClient()

  // Video refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // State
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [progress, setProgress] = useState<LessonProgress | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [savingProgress, setSavingProgress] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [autoMarked75, setAutoMarked75] = useState(false)

  // Load lesson and related data
  useEffect(() => {
    if (!user || !lessonId) return

    const loadLessonData = async () => {
      try {
        // Fetch lesson details
        const { data: lessonData, error: lessonError } = await supabase
          .from("lessons")
          .select("*")
          .eq("id", lessonId)
          .single()

        if (lessonError) throw lessonError
        setLesson(lessonData)

        // Fetch all lessons and modules for navigation
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select("*, lessons(*)")
          .eq("class_id", lessonData.class_id)
          .order("order_index")

        if (modulesError) throw modulesError

        const flatLessons: Lesson[] = []
        modulesData?.forEach((mod: Module) => {
          if (mod.lessons) {
            flatLessons.push(...mod.lessons)
          }
        })

        setAllLessons(flatLessons)
        setModules(modulesData || [])

        // Fetch progress
        const { data: progressData } = await supabase
          .from("lesson_progress")
          .select("*")
          .eq("lesson_id", lessonId)
          .eq("student_id", user.id)
          .maybeSingle()

        if (progressData) {
          setProgress(progressData)
        }

        // Fetch notes
        const { data: notesData } = await supabase
          .from("lesson_notes")
          .select("*")
          .eq("lesson_id", lessonId)
          .eq("student_id", user.id)
          .order("timestamp_seconds")

        setNotes(notesData || [])
      } catch (error) {
        console.error("[v0] Error loading lesson:", error)
      } finally {
        setLoading(false)
      }
    }

    loadLessonData()
  }, [user, lessonId, supabase])

  // Resume from last position
  useEffect(() => {
    if (!videoRef.current || !progress) return

    const resumeTime = (progress.progress_percentage / 100) * (duration || 0)
    if (resumeTime > 0) {
      videoRef.current.currentTime = resumeTime
    }
  }, [progress, duration])

  // Handle video time update
  const handleTimeUpdate = async () => {
    if (!videoRef.current) return

    const current = videoRef.current.currentTime
    const total = videoRef.current.duration
    const percentage = Math.round((current / total) * 100)

    setCurrentTime(current)

    // Auto-mark attendance at 75%
    if (percentage >= 75 && !autoMarked75) {
      setAutoMarked75(true)
      try {
        await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            watched_duration_minutes: Math.round(current / 60),
          }),
        })
      } catch (error) {
        console.error("[v0] Error marking attendance:", error)
      }
    }

    // Save progress periodically
    if (percentage % 10 === 0) {
      await saveProgress(percentage)
    }
  }

  // Save progress to database
  const saveProgress = async (percentage: number) => {
    if (savingProgress) return
    setSavingProgress(true)

    try {
      const { error } = await supabase.from("lesson_progress").upsert(
        {
          lesson_id: lessonId,
          student_id: user?.id,
          progress_percentage: percentage,
          completed: percentage >= 95,
          completed_at: percentage >= 95 ? new Date().toISOString() : null,
          last_accessed: new Date().toISOString(),
        },
        { onConflict: "lesson_id,student_id" }
      )

      if (error) throw error

      setProgress((prev) =>
        prev
          ? { ...prev, progress_percentage: percentage, completed: percentage >= 95 }
          : {
              id: "",
              progress_percentage: percentage,
              completed: percentage >= 95,
              last_accessed: new Date().toISOString(),
              completed_at: percentage >= 95 ? new Date().toISOString() : undefined,
            }
      )
    } catch (error) {
      console.error("[v0] Error saving progress:", error)
    } finally {
      setSavingProgress(false)
    }
  }

  // Add timestamped note
  const handleAddNote = async () => {
    if (!newNote.trim() || !videoRef.current) return

    try {
      const { error } = await supabase.from("lesson_notes").insert({
        lesson_id: lessonId,
        student_id: user?.id,
        timestamp_seconds: Math.round(videoRef.current.currentTime),
        content: newNote,
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      const newNoteObj = {
        id: `note-${Date.now()}`,
        timestamp_seconds: Math.round(videoRef.current.currentTime),
        content: newNote,
        created_at: new Date().toISOString(),
      }

      setNotes([...notes, newNoteObj])
      setNewNote("")
    } catch (error) {
      console.error("[v0] Error saving note:", error)
      alert("Failed to save note")
    }
  }

  // Jump to note timestamp
  const handleJumpToNote = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  // Navigation
  const currentLessonIndex = allLessons.findIndex((l) => l.id === lessonId)
  const previousLesson =
    currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null
  const nextLesson =
    currentLessonIndex < allLessons.length - 1
      ? allLessons[currentLessonIndex + 1]
      : null

  const handlePreviousLesson = () => {
    if (previousLesson) {
      router.push(`/dashboard/lessons/${previousLesson.id}`)
    }
  }

  const handleNextLesson = () => {
    if (nextLesson) {
      router.push(`/dashboard/lessons/${nextLesson.id}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Lesson not found</p>
        </CardContent>
      </Card>
    )
  }

  const progressPercentage = progress?.progress_percentage || 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Video Player */}
        <Card ref={containerRef} className="overflow-hidden">
          <div className="relative bg-black aspect-video">
            <video
              ref={videoRef}
              src={lesson.video_url}
              className="w-full h-full"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              controls
            />
          </div>
        </Card>

        {/* Lesson Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{lesson.title}</CardTitle>
                <CardDescription>{lesson.description}</CardDescription>
              </div>
              {progress?.completed ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span className="text-sm">{progressPercentage}% watched</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {lesson.duration_minutes && (
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{lesson.duration_minutes} minutes</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Time Watched</p>
                <p className="font-medium">
                  {Math.round(currentTime / 60)} of {lesson.duration_minutes || 0} mins
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Lesson Notes
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Add Note */}
            <div className="space-y-2">
              <Textarea
                placeholder="Add a timestamped note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Note
                </Button>
                <span className="text-xs text-muted-foreground pt-2">
                  At {Math.round(currentTime / 60)}:{Math.round(currentTime % 60)
                    .toString()
                    .padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Notes List */}
            {notes.length > 0 && (
              <div className="border-t pt-4 space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <button
                        onClick={() => handleJumpToNote(note.timestamp_seconds)}
                        className="text-xs font-mono text-primary hover:underline"
                      >
                        {Math.floor(note.timestamp_seconds / 60)}:
                        {(note.timestamp_seconds % 60).toString().padStart(2, "0")}
                      </button>
                      <span className="text-xs text-muted-foreground">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-2 justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousLesson}
            disabled={!previousLesson}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Lesson
          </Button>

          <Button
            onClick={handleNextLesson}
            disabled={!nextLesson}
            className="gap-2"
          >
            Next Lesson
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Module Accordion */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Course Content</CardTitle>
          </CardHeader>

          <CardContent>
            <Accordion type="single" collapsible defaultValue={lesson.module_id}>
              {modules.map((module) => (
                <AccordionItem key={module.id} value={module.id}>
                  <AccordionTrigger className="text-sm font-medium hover:no-underline">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {module.title}
                    </div>
                  </AccordionTrigger>

                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {module.lessons?.map((lessonItem) => {
                        const isActive = lessonItem.id === lessonId
                        const lessonProgress = allLessons.find(
                          (l) => l.id === lessonItem.id
                        )

                        return (
                          <button
                            key={lessonItem.id}
                            onClick={() =>
                              router.push(
                                `/dashboard/lessons/${lessonItem.id}`
                              )
                            }
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {isActive && (
                              <Play className="h-3 w-3 fill-current" />
                            )}
                            <span className="flex-1 truncate">
                              {lessonItem.title}
                            </span>
                            {isActive && (
                              <span className="text-xs">
                                {progressPercentage}%
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progress</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Overall Progress
              </p>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {progressPercentage}% complete
              </p>
            </div>

            {autoMarked75 && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-green-800 dark:text-green-300">
                    Attendance Marked
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    At 75% watched
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
