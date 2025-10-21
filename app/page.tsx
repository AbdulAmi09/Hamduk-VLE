"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BookOpen, Users, BarChart3, Lock, Moon, Sun } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/lib/theme-context"

export default function Home() {
  const router = useRouter()
  const { user, loading, signUp, signIn } = useAuth()
  const { theme, setTheme, isDark } = useTheme()

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<"student" | "instructor">("student")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already logged in
  if (!loading && user) {
    router.push("/dashboard")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      if (isLogin) {
        await signIn(email, password)
        router.push("/dashboard")
      } else {
        await signUp(email, password, fullName, role)
        setEmail("")
        setPassword("")
        setFullName("")
        setError("Check your email to confirm your account")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTheme = () => {
    const themes: Array<"light" | "dark" | "system"> = ["light", "dark", "system"]
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4 transition-colors">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-lg bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-shadow"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Features */}
        <div className="hidden md:block space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Hamduk VLE</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Virtual Learning Environment for Modern Education
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Interactive Lectures</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pre-recorded and live sessions with attendance tracking
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Course Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Organize courses, manage enrollments, and track progress
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Analytics & Grading</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Comprehensive assessment tools and performance insights
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Secure & Scalable</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Built for 10,000+ concurrent users with enterprise security
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle>{isLogin ? "Sign In" : "Create Account"}</CardTitle>
            <CardDescription>
              {isLogin ? "Access your courses and learning materials" : "Join Hamduk VLE today"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  className={`p-3 rounded-md text-sm ${error.includes("Check your email") ? "bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200"}`}
                >
                  {error}
                </div>
              )}

              {!isLogin && (
                <Input
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              )}

              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />

              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />

              {!isLogin && (
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "student" | "instructor")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-slate-800 text-foreground"
                  disabled={isSubmitting}
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                </select>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
              </Button>

              {isLogin && (
                <button
                  type="button"
                  onClick={() => router.push("/auth/forgot-password")}
                  className="w-full text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Forgot password?
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError("")
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
