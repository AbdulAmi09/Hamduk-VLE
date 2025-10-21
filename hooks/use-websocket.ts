"use client"

import { useEffect, useRef } from "react"
import { WebSocketManager } from "@/lib/websocket"

export function useWebSocket(url: string, eventType: string, onMessage: (data: any) => void) {
  const wsRef = useRef<WebSocketManager | null>(null)

  useEffect(() => {
    wsRef.current = new WebSocketManager(url)
    wsRef.current.connect()

    const unsubscribe = wsRef.current.subscribe(eventType, onMessage)

    return () => {
      unsubscribe()
      wsRef.current?.disconnect()
    }
  }, [url, eventType, onMessage])

  return wsRef.current
}
