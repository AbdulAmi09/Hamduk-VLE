"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { dbUtils } from "@/lib/db-utils"
import { createClient } from "@/lib/supabase-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  BookOpen,
  Users,
  Clock,
  Archive,
  ArchiveX,
  Edit2,
  Trash2,
  Search,
  Code,
  Eye,
  LogIn,
  LogOut,
  BarChart3,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Class {
  id: string
  title: string
  description?: string
  code?: string
  category?: string
  status: string
  start_date?: string
  end_date?: string
  created_by?: string
  visibility?: string
  enrollments?: Array<{ student_id: string; status: string }>
  modules?: any[]
}

export default function ClassesPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "archived">("all")
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [enrollCode, setEnrollCode] = useState("")
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code: "",
    category: "general",
    visibility: "public",
    start_date: "",
    end_date: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [enrolling, setEnrolling] = useState(false)

  const role = user?.user_metadata?.role || "student"
  const isTutorOrAdmin = ["tutor", "instructor", "school_admin", "platform_admin"].includes(role)

  // Load classes
  useEffect(() => {
    if (!user) return

    const loadClasses = async () => {
      try {
        const userClasses = await dbUtils.getUserClasses(user.id, role)
        setClasses(userClasses || [])
      } catch (error) {
        console.error("[v0] Failed to load classes:", error)
      } finally {
        setLoading(false)
      }
    }

    loadClasses()
  }, [user, role])

  // Filter and search classes
  const filteredClasses = classes.filter((cls) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && cls.status !== "archived") ||
      (filter === "archived" && cls.status === "archived")

    const matchesSearch =
      cls.title.toLowerCase().includes(search.toLowerCase()) ||
      cls.code?.toLowerCase().includes(search.toLowerCase()) ||
      cls.description?.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = selectedCategory === "all" || cls.category === selectedCategory

    return matchesFilter && matchesSearch && matchesCategory
  })

  // Get unique categories
  const categories = Array.from(new Set(classes.map((c) => c.category).filter(Boolean))) as string[]

  // Handle create/update class
  const handleSubmitClass = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingClass) {
        // Update class
        const response = await fetch("/api/classes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classId: editingClass.id,
            ...formData,
          }),
        })

        if (!response.ok) throw new Error("Failed to update class")

        const updated = await response.json()
        setClasses(classes.map((c) => (c.id === updated.id ? updated : c)))
      } else {
        // Create class
        const response = await fetch("/api/classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (!response.ok) throw new Error("Failed to create class")

        const newClass = await response.json()
        setClasses([...classes, newClass])
      }

      setShowCreateModal(false)
      setEditingClass(null)
      setFormData({
        title: "",
        description: "",
        code: "",
        category: "general",
        visibility: "public",
        start_date: "",
        end_date: "",
      })
    } catch (error) {
      console.error("[v0] Error submitting class:", error)
      alert("Failed to save class")
    } finally {
      setSubmitting(false)
    }
  }

  // Handle enroll by code
  const handleEnrollByCode = async () => {
    if (!enrollCode.trim()) return
    setEnrolling(true)

    try {
      // Find class by code
      const classToEnroll = classes.find((c) => c.code === enrollCode.toUpperCase())

      if (!classToEnroll) {
        alert("Invalid class code")
        return
      }

      const response = await fetch("/api/classes/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: classToEnroll.id }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to enroll")
      }

      // Reload classes
      const userClasses = await dbUtils.getUserClasses(user!.id, role)
      setClasses(userClasses || [])

      setShowEnrollModal(false)
      setEnrollCode("")
      alert("Enrolled successfully!")
    } catch (error) {
      console.error("[v0] Error enrolling:", error)
      alert(error instanceof Error ? error.message : "Failed to enroll")
    } finally {
      setEnrolling(false)
    }
  }

  // Handle archive/unarchive
  const handleToggleArchive = async (classId: string, currentStatus: string) => {
    try {
      const response = await fetch("/api/classes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          status: currentStatus === "archived" ? "active" : "archived",
        }),
      })

      if (!response.ok) throw new Error("Failed to update class")

      const updated = await response.json()
      setClasses(classes.map((c) => (c.id === updated.id ? updated : c)))
    } catch (error) {
      console.error("[v0] Error updating class:", error)
      alert("Failed to update class")
    }
  }

  // Handle delete class
  const handleDeleteClass = async (classId: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return

    try {
      const response = await fetch("/api/classes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId }),
      })

      if (!response.ok) throw new Error("Failed to delete class")

      setClasses(classes.filter((c) => c.id !== classId))
    } catch (error) {
      console.error("[v0] Error deleting class:", error)
      alert("Failed to delete class")
    }
  }

  // Handle edit
  const handleEdit = (cls: Class) => {
    setEditingClass(cls)
    setFormData({
      title: cls.title,
      description: cls.description || "",
      code: cls.code || "",
      category: cls.category || "general",
      visibility: cls.visibility || "public",
      start_date: cls.start_date || "",
      end_date: cls.end_date || "",
    })
    setShowCreateModal(true)
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Classes</h1>
          <p className="text-muted-foreground mt-1">
            {isTutorOrAdmin ? "Manage your classes and students" : "View and enroll in classes"}
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {isTutorOrAdmin && (
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingClass ? "Edit Class" : "Create New Class"}</DialogTitle>
                  <DialogDescription>
                    {editingClass
                      ? "Update your class details"
                      : "Create a new class for your students"}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmitClass} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title *</label>
                    <Input
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="e.g., Advanced Python Programming"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Describe your class..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Class Code</label>
                      <Input
                        value={formData.code}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            code: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="e.g., CS101"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="programming">Programming</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="math">Mathematics</SelectItem>
                          <SelectItem value="science">Science</SelectItem>
                          <SelectItem value="language">Language</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Start Date</label>
                      <Input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) =>
                          setFormData({ ...formData, start_date: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">End Date</label>
                      <Input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) =>
                          setFormData({ ...formData, end_date: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Visibility</label>
                    <Select
                      value={formData.visibility}
                      onValueChange={(value) =>
                        setFormData({ ...formData, visibility: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private (Code Only)</SelectItem>
                        <SelectItem value="institution">Institution Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 justify-end pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateModal(false)
                        setEditingClass(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting
                        ? "Saving..."
                        : editingClass
                          ? "Update Class"
                          : "Create Class"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {role === "student" && (
            <Dialog open={showEnrollModal} onOpenChange={setShowEnrollModal}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Enroll by Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enroll in Class</DialogTitle>
                  <DialogDescription>
                    Enter the class code to enroll
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <Input
                    placeholder="Enter class code (e.g., CS101)"
                    value={enrollCode}
                    onChange={(e) => setEnrollCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleEnrollByCode()
                    }}
                  />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowEnrollModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleEnrollByCode}
                      disabled={enrolling || !enrollCode.trim()}
                    >
                      {enrolling ? "Enrolling..." : "Enroll"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes by name, code, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
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

          {categories.length > 0 && (
            <>
              <div className="w-full sm:w-auto">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">
              {search || selectedCategory !== "all"
                ? "No classes match your search"
                : `No ${filter !== "all" ? filter : ""} classes yet`}
            </p>
            <p className="text-sm mt-2">
              {isTutorOrAdmin
                ? "Create your first class to get started"
                : "Enroll in a class using the code above"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((cls) => {
            const studentCount = cls.enrollments?.length || 0
            const isOwner = cls.created_by === user?.id

            return (
              <Card key={cls.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
                {cls.status === "archived" && (
                  <div className="absolute top-3 right-3 bg-background/80 rounded-md p-1">
                    <Archive className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-lg">{cls.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Code className="h-3 w-3" />
                    {cls.code || "No code"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 flex-1">
                  {cls.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {cls.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="space-y-2 text-sm">
                    {cls.category && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium text-xs bg-secondary px-2 py-1 rounded">
                          {cls.category}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {studentCount} student{studentCount !== 1 ? "s" : ""}
                    </div>

                    {cls.modules && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        {cls.modules.length} module{cls.modules.length !== 1 ? "s" : ""}
                      </div>
                    )}

                    {cls.start_date && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {new Date(cls.start_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="pt-2 flex gap-2 flex-wrap">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                        cls.status === "active"
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                          : cls.status === "draft"
                            ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {cls.status?.charAt(0).toUpperCase() +
                        (cls.status?.slice(1) || "")}
                    </span>

                    {cls.visibility && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">
                        <Eye className="h-3 w-3" />
                        {cls.visibility}
                      </span>
                    )}
                  </div>
                </CardContent>

                {/* Footer Actions */}
                <div className="border-t p-4 flex gap-2 flex-wrap">
                  <Link href={`/dashboard/classes/${cls.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      View
                    </Button>
                  </Link>

                  {isOwner && isTutorOrAdmin && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(cls)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleToggleArchive(cls.id, cls.status)
                        }
                      >
                        {cls.status === "archived" ? (
                          <ArchiveX className="h-4 w-4" />
                        ) : (
                          <Archive className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClass(cls.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {!isOwner && role === "student" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const enrollmentExists = cls.enrollments?.some(
                          (e) => e.student_id === user?.id
                        )
                        if (enrollmentExists) {
                          fetch("/api/classes/enroll", {
                            method: "DELETE",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ classId: cls.id }),
                          })
                            .then(() => {
                              setClasses(
                                classes.map((c) =>
                                  c.id === cls.id
                                    ? {
                                        ...c,
                                        enrollments: c.enrollments?.filter(
                                          (e) => e.student_id !== user?.id
                                        ),
                                      }
                                    : c
                                )
                              )
                            })
                            .catch((err) =>
                              console.error("[v0] Unenroll error:", err)
                            )
                        }
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
