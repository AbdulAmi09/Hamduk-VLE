"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Lock, Bell, Eye, Trash2, AlertCircle } from "lucide-react"

interface Settings {
  email_notifications: boolean
  in_app_notifications: boolean
  weekly_digest: boolean
  public_profile: boolean
  show_activity: boolean
  two_factor_enabled: boolean
}

export default function SettingsPage() {
  const { signOut, user } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showDeleteForm, setShowDeleteForm] = useState(false)
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" })
  const [deleteConfirm, setDeleteConfirm] = useState("")

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/settings")
        if (!res.ok) throw new Error("Failed to load settings")
        const data = await res.json()
        setSettings(data.settings)
      } catch (error) {
        console.error("[v0] Failed to load settings:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleSettingChange = async (key: keyof Settings, value: boolean) => {
    const updated = { ...settings, [key]: value }
    setSettings(updated)

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      })
      if (!res.ok) throw new Error("Failed to save settings")
    } catch (error) {
      console.error("[v0] Failed to save settings:", error)
      setSettings(settings)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordData.new || passwordData.new !== passwordData.confirm) {
      alert("Passwords do not match")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.new,
          confirmPassword: passwordData.confirm,
        }),
      })
      if (!res.ok) throw new Error("Failed to change password")
      alert("Password changed successfully")
      setPasswordData({ current: "", new: "", confirm: "" })
      setShowPasswordForm(false)
    } catch (error) {
      console.error("[v0] Error changing password:", error)
      alert("Failed to change password")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE_ACCOUNT") {
      alert("Please type DELETE_ACCOUNT to confirm")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "", confirmDelete: deleteConfirm }),
      })
      if (!res.ok) throw new Error("Failed to delete account")
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("[v0] Error deleting account:", error)
      alert("Failed to delete account")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Notification Preferences */}
      {settings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Control how and when you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium text-sm">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch
                checked={settings.email_notifications}
                onCheckedChange={(value) => handleSettingChange("email_notifications", value)}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium text-sm">In-App Notifications</p>
                <p className="text-xs text-muted-foreground">Show notifications in the app</p>
              </div>
              <Switch
                checked={settings.in_app_notifications}
                onCheckedChange={(value) => handleSettingChange("in_app_notifications", value)}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-sm">Weekly Digest</p>
                <p className="text-xs text-muted-foreground">Summary email every Sunday</p>
              </div>
              <Switch
                checked={settings.weekly_digest}
                onCheckedChange={(value) => handleSettingChange("weekly_digest", value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy Settings */}
      {settings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Privacy
            </CardTitle>
            <CardDescription>Control your profile visibility and data sharing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium text-sm">Public Profile</p>
                <p className="text-xs text-muted-foreground">Allow others to see your profile</p>
              </div>
              <Switch
                checked={settings.public_profile}
                onCheckedChange={(value) => handleSettingChange("public_profile", value)}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-sm">Show Activity</p>
                <p className="text-xs text-muted-foreground">Let others see your activity</p>
              </div>
              <Switch
                checked={settings.show_activity}
                onCheckedChange={(value) => handleSettingChange("show_activity", value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Protect your account with additional security measures</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showPasswordForm ? (
            <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/50">
              <h4 className="font-medium">Change Password</h4>
              <div>
                <label className="text-sm font-medium">Current Password</label>
                <Input
                  type="password"
                  placeholder="Enter current password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  placeholder="Enter new password (min 8 characters)"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? "Saving..." : "Update Password"}
                </Button>
                <Button variant="outline" onClick={() => setShowPasswordForm(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="w-full justify-start" onClick={() => setShowPasswordForm(true)}>
              Change Password
            </Button>
          )}

          <Button variant="outline" className="w-full justify-start" disabled>
            Two-Factor Authentication (Coming Soon)
          </Button>

          <Button variant="outline" className="w-full justify-start" disabled>
            Active Sessions (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showDeleteForm ? (
            <div className="space-y-4 p-4 border border-red-200 dark:border-red-900 rounded-lg bg-red-50 dark:bg-red-950/20">
              <div className="flex gap-2 items-start">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-600 dark:text-red-400">Permanently Delete Account</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    This will permanently delete your account and all your data. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Type DELETE_ACCOUNT to confirm</label>
                <Input
                  placeholder="DELETE_ACCOUNT"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={saving || deleteConfirm !== "DELETE_ACCOUNT"}
                  className="flex-1"
                >
                  {saving ? "Deleting..." : "Delete My Account"}
                </Button>
                <Button variant="outline" onClick={() => setShowDeleteForm(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                onClick={() => setShowDeleteForm(true)}
              >
                Delete Account
              </Button>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Logout */}
      <div className="pt-6 border-t border-border">
        <Button
          onClick={async () => {
            await signOut()
          }}
          variant="destructive"
          className="w-full"
        >
          Logout
        </Button>
      </div>
    </div>
  )
}
