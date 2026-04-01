import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-client"
import { dbUtils } from "@/lib/db-utils"

/**
 * GET /api/certificates?studentId=...
 * Get certificates for a student
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId") || user.id

    const certificates = await dbUtils.getStudentCertificates(studentId)
    return NextResponse.json({ certificates })
  } catch (error) {
    console.error("[v0] Error fetching certificates:", error)
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 })
  }
}

/**
 * POST /api/certificates
 * Issue a certificate (tutor only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 })

    const { user } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const role = user.user_metadata?.role || "student"
    if (!["tutor", "instructor", "school_admin"].includes(role)) {
      return NextResponse.json({ error: "Only tutors can issue certificates" }, { status: 403 })
    }

    const body = await request.json()
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const { data, error } = await supabase
      .from("certificates")
      .insert({
        student_id: body.student_id,
        class_id: body.class_id,
        certificate_number: certificateNumber,
        issue_date: new Date().toISOString(),
        issued_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    // Create notification for student
    await dbUtils.createNotification(body.student_id, {
      title: "Certificate Earned",
      message: "You have successfully earned a new certificate!",
      notification_type: "certificate_earned",
      related_resource_id: data.id,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Error issuing certificate:", error)
    return NextResponse.json({ error: "Failed to issue certificate" }, { status: 500 })
  }
}
