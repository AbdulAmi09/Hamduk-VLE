"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { dbUtils } from "@/lib/db-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Video, Plus, Users, Calendar } from "lucide-react"

interface LiveSession {
  id: string
  title: string
  description?: string
  session_date: string
  duration_minutes?: number
  status: string
  recording_url?: string
}

export default function LiveSessionsPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadClasses = async () => {
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

    loadClasses()
  }, [user])

  useEffect(() => {
    if (!selectedClass) return

    const loadSessions = async () => {
      try {
        const liveSessions = await dbUtils.getLiveSessionsByClass(selectedClass)
        setSessions(liveSessions || [])
      } catch (error) {
        console.error("[v0] Failed to load sessions:", error)
      }
    }

    loadSessions()
  }, [selectedClass])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading sessions...</p>
        </div>
      </div>
    )
  }

  const role = user?.user_metadata?.role || "student"
  const isTutorOrAdmin = role === "tutor" || role === "instructor" || role === "school_admin"

  const now = new Date()
  const upcoming = sessions.filter((s) => new Date(s.session_date) > now)
  const past = sessions.filter((s) => new Date(s.session_date) <= now)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Live Sessions</h1>
          <p className="text-muted-foreground mt-1">Join live classes and interactive sessions</p>
        </div>

        {isTutorOrAdmin && (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Schedule Session
          </Button>
        )}
      </div>

      {/* Class Selection */}
      {classes.length > 0 && (
        <Card>
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
      )}

      {/* Sessions Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>

        {/* Upcoming Sessions */}
        <TabsContent value="upcoming" className="space-y-3">
          {upcoming.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground py-8">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No upcoming sessions</p>
              </CardContent>
            </Card>
          ) : (
            upcoming.map((session) => {
              const sessionDate = new Date(session.session_date)
              const hoursUntil = Math.ceil((sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60))

              return (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{session.title}</h3>
                        {session.description && (
                          <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                        )}
                        <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {sessionDate.toLocaleDateString()} at {sessionDate.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {session.duration_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {session.duration_minutes} min
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {hoursUntil > 0 ? (
                          <>
                            <Button className="gap-2">
                              <Video className="h-4 w-4" />
                              Notify Me
                            </Button>
                            <p className="text-xs text-muted-foreground text-right">{hoursUntil}h away</p>
                          </>
                        ) : (
                          <Button className="gap-2 bg-green-600 hover:bg-green-700">
                            <Video className="h-4 w-4" />
                            Join Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        {/* Past Sessions */}
        <TabsContent value="past" className="space-y-3">
          {past.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground py-8">
                <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No past sessions</p>
              </CardContent>
            </Card>
          ) : (
            past.map((session) => (
              <Card key={session.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{session.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Held on {new Date(session.session_date).toLocaleDateString()}
                      </p>
                    </div>

                    {session.recording_url && (
                      <Button variant="outline" size="sm" className="gap-2">
                        <Video className="h-4 w-4" />
                        View Recording
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
