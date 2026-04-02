"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { dbUtils } from "@/lib/db-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen, Users, Clock, Archive } from "lucide-react"
import Link from "next/link"

interface Class {
  id: string
  title: string
  description?: string
  code?: string
  category?: string
  status: string
  start_date?: string
  end_date?: string
  class_enrollments?: any[]
  modules?: any[]
}

export default function ClassesPage() {
  const { user } = useAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "archived">("all")

  useEffect(() => {
    if (!user) return

    const loadClasses = async () => {
      try {
        const userClasses = await dbUtils.getUserClasses(user.id, user.user_metadata?.role || "student")
        setClasses(userClasses || [])
      } catch (error) {
        console.error("[v0] Failed to load classes:", error)
      } finally {
        setLoading(false)
      }
    }

    loadClasses()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading classes...</p>
        </div>
      </div>
    )
  }

  const role = user?.user_metadata?.role || "student"
  const isTutorOrAdmin = role === "tutor" || role === "instructor" || role === "school_admin"

  const filteredClasses = classes.filter((cls) => {
    if (filter === "active") return cls.status !== "archived"
    if (filter === "archived") return cls.status === "archived"
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Classes</h1>
          <p className="text-muted-foreground mt-1">Manage and view your classes</p>
        </div>

        {isTutorOrAdmin && (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Class
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {["all", "active", "archived"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f as any)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No {filter !== "all" ? filter : ""} classes yet</p>
            <p className="text-sm mt-2">
              {isTutorOrAdmin
                ? "Create your first class to get started"
                : "Enroll in a class to begin learning"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((cls) => (
            <Link key={cls.id} href={`/dashboard/classes/${cls.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                {cls.status === "archived" && (
                  <div className="absolute top-3 right-3">
                    <Archive className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-lg">{cls.title}</CardTitle>
                  <CardDescription>{cls.code || "No code"}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {cls.description && <p className="text-sm text-muted-foreground line-clamp-2">{cls.description}</p>}

                  {/* Stats */}
                  <div className="space-y-2 text-sm">
                    {cls.category && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium">{cls.category}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {cls.class_enrollments?.length || 0} students
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      {cls.modules?.length || 0} modules
                    </div>

                    {cls.start_date && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {new Date(cls.start_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="pt-2">
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      cls.status === "active"
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : cls.status === "draft"
                          ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    }`}>
                      {cls.status?.charAt(0).toUpperCase() + (cls.status?.slice(1) || "")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
