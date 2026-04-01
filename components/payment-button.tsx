"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export interface PaymentButtonProps {
  courseId: string
  courseName: string
  amount: number
  email?: string
}

export function PaymentButton({ courseId, courseName, amount, email }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    if (!email) {
      toast.error("Email is required for payment")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: courseId,
          email,
          amount,
        }),
      })

      const data = await response.json()

      if (data.success && data.authorization_url) {
        // Redirect to Paystack checkout
        window.location.href = data.authorization_url
      } else {
        toast.error(data.error || "Failed to initialize payment")
      }
    } catch (error) {
      console.error("[v0] Payment error:", error)
      toast.error("Payment initialization failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={loading || !email}
      className="w-full"
      size="lg"
    >
      {loading ? "Processing..." : `Pay ₦${amount.toLocaleString()}`}
    </Button>
  )
}
