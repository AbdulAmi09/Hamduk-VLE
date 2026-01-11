import { type NextRequest, NextResponse } from "next/server"
import { initializePayment } from "@/lib/paystack"
import { getSupabaseServer } from "@/lib/supabase-server"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const { course_id, email, amount } = await request.json()

    if (!course_id || !email || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const reference = uuidv4()
    const paymentResponse = await initializePayment(email, amount, reference, {
      course_id,
      email,
    })

    if (!paymentResponse.status) {
      return NextResponse.json({ error: paymentResponse.message }, { status: 400 })
    }

    // Store payment record in database
    const supabase = await getSupabaseServer()
    const { data: user } = await supabase.auth.admin.getUserById(email)

    if (user) {
      await supabase.from("payments").insert({
        user_id: user.id,
        course_id,
        amount,
        currency: "NGN",
        payment_reference: reference,
        status: "pending",
        email,
        metadata: { paystack_access_code: paymentResponse.data.access_code },
      })
    }

    return NextResponse.json({
      success: true,
      authorization_url: paymentResponse.data.authorization_url,
      access_code: paymentResponse.data.access_code,
      reference,
    })
  } catch (error) {
    console.error("[v0] Payment initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 })
  }
}
