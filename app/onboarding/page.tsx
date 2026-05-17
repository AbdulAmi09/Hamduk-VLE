"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase-client"
import { Loader2 } from "lucide-react"

type OnboardingStep = "role_selection" | "profile_completion" | "complete"

export default function OnboardingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [step, setStep] = useState<OnboardingStep>("role_selection")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Profile form state
  const [profile, setProfile] = useState({
    full_name: "",
    display_name: "",
    bio: "",
    timezone: "UTC",
    role: "student" as "student" | "instructor" | "tutor",
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  const handleRoleSelection = async (selectedRole: "student" | "instructor" | "tutor") => {
    setIsSubmitting(true)
    setError("")

    try {
      const supabase = createClient()
      if (!supabase) throw new Error("Supabase client not available")

      // Update profile with role
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role: selectedRole })
        .eq("id", user?.id)

      if (updateError) throw updateError

      setProfile((prev) => ({ ...prev, role: selectedRole }))
      setStep("profile_completion")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProfileCompletion = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const supabase = createClient()
      if (!supabase) throw new Error("Supabase client not available")

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          display_name: profile.display_name,
          timezone: profile.timezone,
          onboarding_completed: true,
          profile_completion_step: "complete",
        })
        .eq("id", user?.id)

      if (updateError) throw updateError

      setStep("complete")

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {step === "role_selection" && (
          <>
            <CardHeader>
              <CardTitle>Welcome to Hamduk VLE</CardTitle>
              <CardDescription>Choose your role to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

              <Button
                onClick={() => handleRoleSelection("student")}
                disabled={isSubmitting}
                variant="outline"
                className="w-full h-auto py-4 text-left"
              >
                <div>
                  <div className="font-semibold">Student</div>
                  <div className="text-sm text-muted-foreground">Learn from courses and complete assessments</div>
                </div>
              </Button>

              <Button
                onClick={() => handleRoleSelection("instructor")}
                disabled={isSubmitting}
                variant="outline"
                className="w-full h-auto py-4 text-left"
              >
                <div>
                  <div className="font-semibold">Instructor</div>
                  <div className="text-sm text-muted-foreground">Create courses and manage students</div>
                </div>
              </Button>

              <Button
                onClick={() => handleRoleSelection("tutor")}
                disabled={isSubmitting}
                variant="outline"
                className="w-full h-auto py-4 text-left"
              >
                <div>
                  <div className="font-semibold">Tutor</div>
                  <div className="text-sm text-muted-foreground">Provide one-on-one guidance</div>
                </div>
              </Button>
            </CardContent>
          </>
        )}

        {step === "profile_completion" && (
          <>
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>Add some basic information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileCompletion} className="space-y-4">
                {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

                <div>
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input
                    type="text"
                    placeholder="Your full name"
                    value={profile.full_name}
                    onChange={(e) => setProfile((prev) => ({ ...prev, full_name: e.target.value }))}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Display Name</label>
                  <Input
                    type="text"
                    placeholder="How you want to be known"
                    value={profile.display_name}
                    onChange={(e) => setProfile((prev) => ({ ...prev, display_name: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Timezone</label>
                  <select
                    value={profile.timezone}
                    onChange={(e) => setProfile((prev) => ({ ...prev, timezone: e.target.value }))}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border rounded-md border-input bg-background"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time (EST)</option>
                    <option value="CST">Central Time (CST)</option>
                    <option value="MST">Mountain Time (MST)</option>
                    <option value="PST">Pacific Time (PST)</option>
                    <option value="GMT">GMT</option>
                    <option value="CET">Central European Time (CET)</option>
                    <option value="IST">Indian Standard Time (IST)</option>
                    <option value="JST">Japan Standard Time (JST)</option>
                    <option value="AEST">Australia Eastern (AEST)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("role_selection")}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Continue
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        )}

        {step === "complete" && (
          <>
            <CardHeader>
              <CardTitle>All Set!</CardTitle>
              <CardDescription>Your profile is ready</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Redirecting to dashboard...</p>
              <Loader2 className="w-6 h-6 mx-auto animate-spin" />
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
