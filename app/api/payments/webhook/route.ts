import { type NextRequest, NextResponse } from "next/server"
import { verifyPaystackWebhook, verifyPayment } from "@/lib/paystack"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-paystack-signature") || ""
    const body = await request.text()

    // Verify webhook signature
    if (!verifyPaystackWebhook(signature, body)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)

    if (event.event === "charge.success") {
      const reference = event.data.reference
      const paymentData = await verifyPayment(reference)

      if (paymentData.status && paymentData.data.status === "success") {
        const supabase = await getSupabaseServer()

        // Update payment in database
        await supabase
          .from("payments")
          .update({
            status: "completed",
            paystack_reference: paymentData.data.id.toString(),
            completed_at: new Date().toISOString(),
          })
          .eq("payment_reference", reference)

        console.log(`[v0] Payment ${reference} confirmed via webhook`)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
