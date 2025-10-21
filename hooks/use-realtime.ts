"use client"

import { useEffect, useState } from "react"

export function useRealtime(eventType: string, courseId: string | null) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!courseId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/realtime?type=${eventType}&courseId=${courseId}`)
        const result = await response.json()

        if (!response.ok) throw new Error(result.error)
        setData(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [eventType, courseId])

  return { data, loading, error }
}
