"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, FileText, Calendar } from "lucide-react"

interface CourseCardProps {
  code: string
  title: string
  description?: string
  students: number
  lectures: number
  startDate: string
  endDate: string
  onEdit?: () => void
  onDelete?: () => void
  onManage?: () => void
}

export function CourseCard({
  code,
  title,
  description,
  students,
  lectures,
  startDate,
  endDate,
  onEdit,
  onDelete,
  onManage,
}: CourseCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{code}</CardDescription>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {description && <p className="text-sm text-gray-600">{description}</p>}

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span>{students} students</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <FileText className="w-4 h-4" />
            <span>{lectures} lectures</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">{startDate}</span>
          </div>
        </div>

        {onManage && (
          <Button onClick={onManage} className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
            Manage Course
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
