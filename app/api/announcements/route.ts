import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin, createAuditLog } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const institutionId = searchParams.get('institutionId');

    let query = supabase.from('announcements').select('*');

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    if (institutionId) {
      query = query.eq('institution_id', institutionId);
    }

    const { data: announcements, error } = await query
      .order('is_pinned', { ascending: false })
      .order('posted_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('[Announcements GET Error]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
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

    const { courseId, institutionId, title, content, visibility, expiresAt } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user is instructor for course or admin
    if (courseId) {
      const { data: course } = await supabase
        .from('courses')
        .select('instructor_id')
        .eq('id', courseId)
        .single();

      if (course?.instructor_id !== user.id) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    // Create announcement
    const { error } = await supabaseAdmin
      .from('announcements')
      .insert([
        {
          course_id: courseId,
          institution_id: institutionId,
          instructor_id: user.id,
          title,
          content,
          visibility: visibility || 'all',
          expires_at: expiresAt,
          posted_date: new Date().toISOString(),
        },
      ]);

    if (error) throw error;

    // Audit log
    await createAuditLog({
      user_id: user.id,
      action: 'ANNOUNCEMENT_CREATED',
      resource_type: 'announcements',
      changes: { courseId, title },
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: 'Announcement created',
    });
  } catch (error) {
    console.error('[Announcements POST Error]:', error);
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}
