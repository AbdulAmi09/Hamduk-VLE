"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      await resetPassword(email)
      setSuccess(true)
      setEmail("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md text-sm bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-md text-sm bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200">
                Check your email for a password reset link
              </div>
            )}

            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting || success}
            />

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting || success}>
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
