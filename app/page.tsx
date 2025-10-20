"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BookOpen, Users, BarChart3, Lock } from "lucide-react"

export default function Home() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<"student" | "instructor">("student")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement actual auth
    console.log("[v0] Auth attempt:", { email, isLogin })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Features */}
        <div className="hidden md:block space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Hamduk VLE</h1>
            <p className="text-xl text-gray-600">Virtual Learning Environment for Modern Education</p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <BookOpen className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Interactive Lectures</h3>
                <p className="text-sm text-gray-600">Pre-recorded and live sessions with attendance tracking</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Users className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Course Management</h3>
                <p className="text-sm text-gray-600">Organize courses, manage enrollments, and track progress</p>
              </div>
            </div>

            <div className="flex gap-4">
              <BarChart3 className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Analytics & Grading</h3>
                <p className="text-sm text-gray-600">Comprehensive assessment tools and performance insights</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Lock className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Secure & Scalable</h3>
                <p className="text-sm text-gray-600">Built for 10,000+ concurrent users with enterprise security</p>
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
              {!isLogin && (
                <Input
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              )}

              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {!isLogin && (
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "student" | "instructor")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                </select>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                {isLogin ? "Sign In" : "Create Account"}
              </Button>

              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
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
