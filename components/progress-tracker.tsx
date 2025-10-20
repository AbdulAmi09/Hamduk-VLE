"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"

interface StudentProgress {
  studentId: string
  studentName: string
  lecturesCompleted: number
  totalLectures: number
  assessmentScore: number
  attendanceRate: number
  lastActive: string
}

const mockProgressData: StudentProgress[] = [
  {
    studentId: "STU001",
    studentName: "John Doe",
    lecturesCompleted: 8,
    totalLectures: 10,
    assessmentScore: 85,
    attendanceRate: 90,
    lastActive: "2024-11-09",
  },
  {
    studentId: "STU002",
    studentName: "Jane Smith",
    lecturesCompleted: 6,
    totalLectures: 10,
    assessmentScore: 78,
    attendanceRate: 75,
    lastActive: "2024-11-08",
  },
  {
    studentId: "STU003",
    studentName: "Ahmed Hassan",
    lecturesCompleted: 10,
    totalLectures: 10,
    assessmentScore: 92,
    attendanceRate: 100,
    lastActive: "2024-11-09",
  },
]

const classProgressData = [
  { week: "Week 1", avgScore: 72, attendance: 85 },
  { week: "Week 2", avgScore: 75, attendance: 82 },
  { week: "Week 3", avgScore: 78, attendance: 88 },
  { week: "Week 4", avgScore: 82, attendance: 90 },
]

export function ProgressTracker() {
  const avgAttendance = Math.round(
    mockProgressData.reduce((sum, s) => sum + s.attendanceRate, 0) / mockProgressData.length,
  )
  const avgScore = Math.round(mockProgressData.reduce((sum, s) => sum + s.assessmentScore, 0) / mockProgressData.length)

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Attendance</p>
                <p className="text-2xl font-bold">{avgAttendance}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Assessment Score</p>
                <p className="text-2xl font-bold">{avgScore}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{mockProgressData.length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Class Progress Over Time</CardTitle>
          <CardDescription>Average scores and attendance by week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={classProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgScore" stroke="#3b82f6" name="Avg Score" />
              <Line type="monotone" dataKey="attendance" stroke="#10b981" name="Attendance %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Individual Student Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Student Progress Details</CardTitle>
          <CardDescription>Individual performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockProgressData.map((student) => (
              <div key={student.studentId} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{student.studentName}</p>
                    <p className="text-xs text-gray-500">{student.studentId}</p>
                  </div>
                  {student.attendanceRate >= 90 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : student.attendanceRate >= 75 ? (
                    <Clock className="w-5 h-5 text-orange-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="text-gray-600 text-xs">Lectures</p>
                    <p className="font-semibold">
                      {student.lecturesCompleted}/{student.totalLectures}
                    </p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="text-gray-600 text-xs">Assessment</p>
                    <p className="font-semibold">{student.assessmentScore}%</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="text-gray-600 text-xs">Attendance</p>
                    <p className="font-semibold">{student.attendanceRate}%</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="text-gray-600 text-xs">Last Active</p>
                    <p className="font-semibold text-xs">{student.lastActive}</p>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium w-20">Lectures:</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${(student.lecturesCompleted / student.totalLectures) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium w-20">Assessment:</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${student.assessmentScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
