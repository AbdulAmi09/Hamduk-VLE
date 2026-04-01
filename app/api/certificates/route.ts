import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin, createAuditLog } from '@/lib/db';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    let query = supabase
      .from('certificates')
      .select('*, courses(title)')
      .eq('student_id', user.id);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data: certificates, error } = await query
      .order('issue_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error('[Certificates GET Error]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { studentId, courseId } = await req.json();

    if (!studentId || !courseId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if student completed course (all assessments graded)
    const { data: assessments } = await supabase
      .from('v_assessment_submission_status')
      .select('*')
      .eq('course_id', courseId);

    const allGraded = assessments?.every((a) => a.graded === a.total_students);

    if (!allGraded) {
      return NextResponse.json(
        { error: 'Not all assessments have been graded' },
        { status: 400 }
      );
    }

    // Check if certificate already exists
    const { data: existing } = await supabase
      .from('certificates')
      .select('id')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Certificate already exists' },
        { status: 400 }
      );
    }

    // Generate certificate number and verification token
    const certificateNumber = `HAMDUK-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create certificate
    const { error } = await supabaseAdmin
      .from('certificates')
      .insert([
        {
          student_id: studentId,
          course_id: courseId,
          certificate_number: certificateNumber,
          verification_token: verificationToken,
          public_url: `/certificates/verify/${verificationToken}`,
          issue_date: new Date().toISOString(),
        },
      ]);

    if (error) throw error;

    // Audit log
    await createAuditLog({
      action: 'CERTIFICATE_GENERATED',
      resource_type: 'certificates',
      resource_id: studentId,
      changes: { courseId, certificateNumber },
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: 'Certificate generated',
      certificateNumber,
    });
  } catch (error) {
    console.error('[Certificates POST Error]:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}
