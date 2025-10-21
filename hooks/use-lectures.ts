"use client"

import { useEffect, useState } from "react"

export function useLectures(courseId: string | null) {
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!courseId) return

    const fetchLectures = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/lectures?courseId=${courseId}`)
        const data = await response.json()

        if (!response.ok) throw new Error(data.error)
        setLectures(data.lectures || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch lectures")
      } finally {
        setLoading(false)
      }
    }

    fetchLectures()
  }, [courseId])

  return { lectures, loading, error }
}
