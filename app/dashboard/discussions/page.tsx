"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Plus, MessageCircle } from "lucide-react"

interface Discussion {
  id: string
  title: string
  content: string
  author_id: string
  class_id: string
  created_at: string
  reply_count: number
  is_answered: boolean
}

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: "", content: "", class_id: "" })

  useEffect(() => {
    loadDiscussions()
  }, [])

  const loadDiscussions = async () => {
    try {
      const res = await fetch("/api/discussions")
      if (res.ok) {
        const data = await res.json()
        setDiscussions(data.discussions || [])
      }
    } catch (error) {
      console.error("[v0] Error loading discussions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDiscussion = async () => {
    if (!formData.title || !formData.content) {
      alert("Please fill in all fields")
      return
    }

    try {
      const res = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to create discussion")

      const data = await res.json()
      setDiscussions([data, ...discussions])
      setFormData({ title: "", content: "", class_id: "" })
      setShowForm(false)
    } catch (error) {
      console.error("[v0] Error creating discussion:", error)
      alert("Failed to create discussion")
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
            <MessageSquare className="h-8 w-8" />
            Class Discussions
          </h1>
          <p className="text-muted-foreground mt-2">Ask questions and engage with classmates</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Discussion
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Start a Discussion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Discussion title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Textarea
              placeholder="Your question or topic"
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateDiscussion}>Post Discussion</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {discussions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No discussions yet. Start one!
            </CardContent>
          </Card>
        ) : (
          discussions.map((disc) => (
            <Card key={disc.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{disc.title}</CardTitle>
                      {disc.is_answered && <Badge className="bg-green-500">Answered</Badge>}
                    </div>
                    <CardDescription>
                      {new Date(disc.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    {disc.reply_count} replies
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground line-clamp-2">{disc.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
