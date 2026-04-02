"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Bell, Plus, Trash2, Edit2, Pin } from "lucide-react"

interface Announcement {
  id: string
  title: string
  content: string
  class_id?: string
  created_by: string
  created_at: string
  expires_at?: string
  is_pinned: boolean
}

export default function AnnouncementsPage() {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: "", content: "", class_id: "" })
  const [userRole, setUserRole] = useState<string>("student")

  useEffect(() => {
    loadAnnouncements()
    checkUserRole()
  }, [])

  const checkUserRole = async () => {
    try {
      const res = await fetch("/api/profiles")
      if (res.ok) {
        const data = await res.json()
        setUserRole(data.profile?.role || "student")
      }
    } catch (error) {
      console.error("[v0] Error checking role:", error)
    }
  }

  const loadAnnouncements = async () => {
    try {
      const res = await fetch("/api/announcements")
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data.announcements || [])
      }
    } catch (error) {
      console.error("[v0] Error loading announcements:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAnnouncement = async () => {
    if (!formData.title || !formData.content) {
      alert("Please fill in all fields")
      return
    }

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to create announcement")

      const data = await res.json()
      setAnnouncements([data, ...announcements])
      setFormData({ title: "", content: "", class_id: "" })
      setShowForm(false)
    } catch (error) {
      console.error("[v0] Error creating announcement:", error)
      alert("Failed to create announcement")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return

    try {
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" })
      if (res.ok) {
        setAnnouncements(announcements.filter((a) => a.id !== id))
      }
    } catch (error) {
      console.error("[v0] Error deleting announcement:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Announcements
          </h1>
          <p className="text-muted-foreground mt-2">Stay updated with class announcements</p>
        </div>
        {["tutor", "instructor", "school_admin"].includes(userRole) && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Create Announcement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Announcement title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Textarea
              placeholder="Announcement content"
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateAnnouncement}>Post Announcement</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No announcements yet
            </CardContent>
          </Card>
        ) : (
          announcements.map((ann) => (
            <Card key={ann.id} className={ann.is_pinned ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{ann.title}</CardTitle>
                      {ann.is_pinned && <Badge>Pinned</Badge>}
                    </div>
                    <CardDescription>
                      {new Date(ann.created_at).toLocaleDateString()} at{" "}
                      {new Date(ann.created_at).toLocaleTimeString()}
                    </CardDescription>
                  </div>
                  {["tutor", "instructor", "school_admin"].includes(userRole) && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(ann.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{ann.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
