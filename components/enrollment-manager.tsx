"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UserPlus, Upload, X } from "lucide-react"

interface EnrollmentData {
  email: string
  firstName: string
  lastName: string
}

export function EnrollmentManager({ courseId, onEnroll }: { courseId: string; onEnroll: (data: any) => void }) {
  const [enrollmentMethod, setEnrollmentMethod] = useState<"manual" | "bulk" | "code">("manual")
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [bulkEmails, setBulkEmails] = useState("")
  const [enrollmentCode, setEnrollmentCode] = useState("")
  const [enrolledStudents, setEnrolledStudents] = useState<EnrollmentData[]>([])

  const handleManualEnroll = () => {
    if (email && firstName && lastName) {
      const newStudent = { email, firstName, lastName }
      setEnrolledStudents([...enrolledStudents, newStudent])
      setEmail("")
      setFirstName("")
      setLastName("")
      onEnroll({ method: "manual", student: newStudent, courseId })
    }
  }

  const handleBulkEnroll = () => {
    const emails = bulkEmails
      .split("\n")
      .map((e) => e.trim())
      .filter((e) => e)
    if (emails.length > 0) {
      onEnroll({ method: "bulk", emails, courseId })
      setBulkEmails("")
    }
  }

  const removeStudent = (index: number) => {
    setEnrolledStudents(enrolledStudents.filter((_, i) => i !== index))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Enroll Students</CardTitle>
        <CardDescription>Add students to your course</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enrollment Method Tabs */}
        <div className="flex gap-2 border-b">
          {["manual", "bulk", "code"].map((method) => (
            <button
              key={method}
              onClick={() => setEnrollmentMethod(method as any)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                enrollmentMethod === method
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {method === "manual" && "Manual"}
              {method === "bulk" && "Bulk Upload"}
              {method === "code" && "Enrollment Code"}
            </button>
          ))}
        </div>

        {/* Manual Enrollment */}
        {enrollmentMethod === "manual" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button onClick={handleManualEnroll} className="px-6">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Enroll
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Upload */}
        {enrollmentMethod === "bulk" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulkEmails">Email Addresses (one per line)</Label>
              <Textarea
                id="bulkEmails"
                placeholder="student1@example.com&#10;student2@example.com&#10;student3@example.com"
                value={bulkEmails}
                onChange={(e) => setBulkEmails(e.target.value)}
                rows={6}
              />
            </div>
            <Button onClick={handleBulkEnroll} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Enroll {bulkEmails.split("\n").filter((e) => e.trim()).length} Students
            </Button>
          </div>
        )}

        {/* Enrollment Code */}
        {enrollmentMethod === "code" && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Share this code with students to self-enroll:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 bg-white border rounded font-mono text-lg font-semibold">
                  {enrollmentCode || "COURSE-2024-ABC123"}
                </code>
                <Button variant="outline" className="bg-transparent">
                  Copy
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Students can use this code to enroll themselves in the course without instructor approval.
            </p>
          </div>
        )}

        {/* Enrolled Students List */}
        {enrolledStudents.length > 0 && (
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold">Recently Enrolled</h3>
            <div className="space-y-2">
              {enrolledStudents.map((student, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                  <button onClick={() => removeStudent(idx)} className="text-red-500 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
