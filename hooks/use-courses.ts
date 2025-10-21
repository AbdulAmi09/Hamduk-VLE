"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"

export function useCourses() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchCourses = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/courses?instructorId=${user.id}`)
        const data = await response.json()

        if (!response.ok) throw new Error(data.error)
        setCourses(data.courses || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch courses")
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [user])

  return { courses, loading, error }
}
