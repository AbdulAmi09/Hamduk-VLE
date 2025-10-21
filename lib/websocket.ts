export class WebSocketManager {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private listeners: Map<string, Set<(data: any) => void>> = new Map()

  constructor(url: string) {
    this.url = url
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log("[v0] WebSocket connected")
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const eventType = data.type

          if (this.listeners.has(eventType)) {
            this.listeners.get(eventType)?.forEach((callback) => callback(data))
          }
        } catch (error) {
          console.error("[v0] WebSocket message parse error:", error)
        }
      }

      this.ws.onerror = (error) => {
        console.error("[v0] WebSocket error:", error)
      }

      this.ws.onclose = () => {
        console.log("[v0] WebSocket disconnected")
        this.attemptReconnect()
      }
    } catch (error) {
      console.error("[v0] WebSocket connection error:", error)
      this.attemptReconnect()
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`[v0] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      setTimeout(() => this.connect(), this.reconnectDelay)
    }
  }

  subscribe(eventType: string, callback: (data: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)?.add(callback)

    return () => {
      this.listeners.get(eventType)?.delete(callback)
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn("[v0] WebSocket is not connected")
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}
