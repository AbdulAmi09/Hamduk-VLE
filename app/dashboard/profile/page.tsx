"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { dbUtils } from "@/lib/db-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Mail, Globe, MapPin, Clock } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (!user) return

    const loadProfile = async () => {
      try {
        const userProfile = await dbUtils.getUserById(user.id)
        setProfile(userProfile)
        setFormData(userProfile || {})
      } catch (error) {
        console.error("[v0] Failed to load profile:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const res = await fetch("/api/profiles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to update profile")

      const data = await res.json()
      setProfile(data.profile)
      setEditing(false)
    } catch (error) {
      console.error("[v0] Failed to update profile:", error)
      alert("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account information</p>
      </div>

      {/* Main Profile Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </div>
          <Button
            variant={editing ? "destructive" : "default"}
            onClick={() => {
              if (editing) {
                setFormData(profile || {})
              }
              setEditing(!editing)
            }}
          >
            {editing ? "Cancel" : "Edit"}
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Profile Photo */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
            </div>
            {editing && (
              <Button variant="outline" size="sm">
                Change Photo
              </Button>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <Input
                disabled={!editing}
                value={formData.full_name || ""}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="mt-2"
                placeholder="Your full name"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <Input disabled value={user?.email || ""} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>

            {/* Display Name */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Display Name</label>
              <Input
                disabled={!editing}
                value={formData.display_name || ""}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="mt-2"
                placeholder="How you want to be displayed"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Bio</label>
              <Textarea
                disabled={!editing}
                value={formData.bio || ""}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="mt-2"
                placeholder="Tell us about yourself"
                rows={4}
              />
            </div>

            {/* Country */}
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Country
              </label>
              <Input
                disabled={!editing}
                value={formData.country || ""}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="mt-2"
                placeholder="Your country"
              />
            </div>

            {/* Timezone */}
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timezone
              </label>
              <Input
                disabled={!editing}
                value={formData.timezone || ""}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="mt-2"
                placeholder="e.g., Africa/Lagos"
              />
            </div>

            {/* Language */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Language</label>
              <Select disabled={!editing} value={formData.language_preference || "en"} onValueChange={(value) =>
                setFormData({ ...formData, language_preference: value })
              }>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="ha">Hausa</SelectItem>
                  <SelectItem value="yo">Yoruba</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Visibility */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Profile Visibility</label>
              <Select disabled={!editing} value={formData.profile_visibility || "private"} onValueChange={(value) =>
                setFormData({ ...formData, profile_visibility: value })
              }>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Social Links */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">LinkedIn URL</label>
              <Input
                disabled={!editing}
                value={formData.linkedin_url || ""}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                className="mt-2"
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Twitter URL</label>
              <Input
                disabled={!editing}
                value={formData.twitter_url || ""}
                onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                className="mt-2"
                placeholder="https://twitter.com/..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website
              </label>
              <Input
                disabled={!editing}
                value={formData.website_url || ""}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="mt-2"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Save Button */}
          {editing && (
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Account Type</span>
            <span className="font-medium capitalize">{profile?.role || "Student"}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium text-green-600">Active</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Member Since</span>
            <span className="font-medium">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
