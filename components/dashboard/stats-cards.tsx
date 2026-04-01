"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, BookOpen, BarChart3, Users } from "lucide-react"

interface StatsCardsProps {
  enrolledCourses?: number
  averageGrade?: number
  certificates?: number
  upcomingSessions?: number
}

export function StatsCards({ enrolledCourses = 0, averageGrade = 0, certificates = 0, upcomingSessions = 0 }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Enrolled Courses</span>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{enrolledCourses}</div>
          <p className="text-xs text-muted-foreground mt-1">Active courses</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Average Grade</span>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageGrade}%</div>
          <p className="text-xs text-muted-foreground mt-1">Overall performance</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Certificates</span>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{certificates}</div>
          <p className="text-xs text-muted-foreground mt-1">Earned certifications</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Upcoming Sessions</span>
            <Users className="h-4 w-4 text-purple-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingSessions}</div>
          <p className="text-xs text-muted-foreground mt-1">Live classes this week</p>
        </CardContent>
      </Card>
    </div>
  )
}
