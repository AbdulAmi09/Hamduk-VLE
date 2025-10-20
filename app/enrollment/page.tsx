"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnrollmentManager } from "@/components/enrollment-manager"
import { ProgressTracker } from "@/components/progress-tracker"

export default function EnrollmentPage() {
  const [activeTab, setActiveTab] = useState("manage")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enrollment & Progress</h1>
        <p className="text-gray-600">Manage student enrollment and track learning progress</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage">Manage Enrollment</TabsTrigger>
          <TabsTrigger value="progress">Track Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4">
          <EnrollmentManager courseId="course-1" onEnroll={(data) => console.log("[v0] Enrollment:", data)} />
        </TabsContent>

        <TabsContent value="progress">
          <ProgressTracker />
        </TabsContent>
      </Tabs>
    </div>
  )
}
