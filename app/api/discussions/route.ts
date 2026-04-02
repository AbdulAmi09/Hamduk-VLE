import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin, createAuditLog } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lectureId = searchParams.get('lectureId');
    const courseId = searchParams.get('courseId');

    let query = supabase
      .from('discussions')
      .select('*, profiles(full_name, avatar_url)');

    if (lectureId) {
      query = query.eq('lecture_id', lectureId);
    }

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data: discussions, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ discussions });
  } catch (error) {
    console.error('[Discussions GET Error]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      lectureId,
      courseId,
      title,
      content,
      isQuestion,
    } = await req.json();

    if (!lectureId || !courseId || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user is enrolled in course
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', user.id)
      .eq('course_id', courseId)
      .single();

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in course' },
        { status: 403 }
      );
    }

    // Create discussion
    const { error } = await supabaseAdmin
      .from('discussions')
      .insert([
        {
          lecture_id: lectureId,
          course_id: courseId,
          user_id: user.id,
          title,
          content,
          is_question: isQuestion || false,
          is_answered: false,
          reply_count: 0,
        },
      ]);

    if (error) throw error;

    // Audit log
    await createAuditLog({
      user_id: user.id,
      action: 'DISCUSSION_CREATED',
      resource_type: 'discussions',
      changes: { lectureId, courseId, title },
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: 'Discussion created',
    });
  } catch (error) {
    console.error('[Discussions POST Error]:', error);
    return NextResponse.json(
      { error: 'Failed to create discussion' },
      { status: 500 }
    );
  }
}
