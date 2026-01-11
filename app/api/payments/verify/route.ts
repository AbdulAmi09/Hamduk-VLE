import { type NextRequest, NextResponse } from "next/server"
import { verifyPayment } from "@/lib/paystack"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: "Reference required" }, { status: 400 })
    }

    const paymentData = await verifyPayment(reference)

    if (!paymentData.status || paymentData.data.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    const supabase = await getSupabaseServer()

    // Update payment status
    const { data: payment } = await supabase
      .from("payments")
      .update({
        status: "completed",
        paystack_reference: paymentData.data.id.toString(),
        completed_at: new Date().toISOString(),
      })
      .eq("payment_reference", reference)
      .select()
      .single()

    if (payment) {
      // Create enrollment if payment successful
      const { data: enrollment } = await supabase
        .from("enrollments")
        .insert({
          student_id: payment.user_id,
          course_id: payment.course_id,
          payment_status: "completed",
          payment_id: payment.id,
        })
        .select()
        .single()

      return NextResponse.json({
        success: true,
        payment,
        enrollment,
      })
    }

    return NextResponse.json({ error: "Payment record not found" }, { status: 404 })
  } catch (error) {
    console.error("[v0] Payment verification error:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
