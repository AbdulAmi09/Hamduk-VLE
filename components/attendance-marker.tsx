"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"

interface AttendanceMarkerProps {
  lectureId: string
  studentId: string
  isMandatory: boolean
  watchedPercentage: number
  onMarkAttendance: (lectureId: string, attended: boolean) => void
}

export function AttendanceMarker({
  lectureId,
  studentId,
  isMandatory,
  watchedPercentage,
  onMarkAttendance,
}: AttendanceMarkerProps) {
  const [isMarked, setIsMarked] = useState(false)
  const minWatchPercentage = 75

  const canMarkAttendance = watchedPercentage >= minWatchPercentage

  const handleMarkAttendance = () => {
    if (canMarkAttendance) {
      onMarkAttendance(lectureId, true)
      setIsMarked(true)
    }
  }

  return (
    <Card className={isMandatory ? "border-red-200 bg-red-50" : ""}>
      <CardHeader>
        <CardTitle className="text-lg">Attendance</CardTitle>
        <CardDescription>{isMandatory ? "This is a mandatory lecture" : "Optional lecture"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Watch Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Watch Progress</span>
            <span className="text-sm font-bold text-gray-900">{Math.round(watchedPercentage)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${watchedPercentage >= minWatchPercentage ? "bg-green-500" : "bg-blue-500"}`}
              style={{ width: `${watchedPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">Watch at least {minWatchPercentage}% to mark attendance</p>
        </div>

        {/* Status */}
        <div className="space-y-2">
          {isMarked ? (
            <div className="flex items-center gap-2 p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Attendance marked</span>
            </div>
          ) : canMarkAttendance ? (
            <div className="flex items-center gap-2 p-3 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Ready to mark attendance</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">
                Watch more to mark attendance ({minWatchPercentage}% required)
              </span>
            </div>
          )}
        </div>

        {/* Mark Attendance Button */}
        <Button
          onClick={handleMarkAttendance}
          disabled={!canMarkAttendance || isMarked}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
        >
          {isMarked ? "Attendance Marked" : "Mark Attendance"}
        </Button>
      </CardContent>
    </Card>
  )
}
