"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface CourseFormProps {
  onSubmit: (data: CourseData) => void
  onCancel: () => void
  initialData?: CourseData
}

export interface CourseData {
  code: string
  title: string
  description: string
  semester: string
  startDate: string
  endDate: string
}

export function CourseForm({ onSubmit, onCancel, initialData }: CourseFormProps) {
  const [formData, setFormData] = useState<CourseData>(
    initialData || {
      code: "",
      title: "",
      description: "",
      semester: "",
      startDate: "",
      endDate: "",
    },
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{initialData ? "Edit Course" : "Create New Course"}</CardTitle>
        <CardDescription>Fill in the course details below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
              <Input name="code" value={formData.code} onChange={handleChange} placeholder="e.g., CS101" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              >
                <option value="">Select semester</option>
                <option value="Fall 2025">Fall 2025</option>
                <option value="Spring 2026">Spring 2026</option>
                <option value="Summer 2026">Summer 2026</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Introduction to Computer Science"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Course description and objectives"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <Input name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <Input name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {initialData ? "Update Course" : "Create Course"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
