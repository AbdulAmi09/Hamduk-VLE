import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin, createAuditLog } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status');

    let query = supabase
      .from('live_sessions')
      .select('*, instructor:profiles!instructor_id(full_name, avatar_url)');

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: sessions, error } = await query
      .order('scheduled_start', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('[Live Sessions GET Error]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
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
      courseId,
      title,
      description,
      scheduledStart,
      scheduledEnd,
      isRecurring,
      recurrencePattern,
      maxParticipants,
    } = await req.json();

    if (!courseId || !title || !scheduledStart || !scheduledEnd) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user is instructor
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

    // Generate Daily.co room name
    const roomName = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Create live session
    const { error } = await supabaseAdmin
      .from('live_sessions')
      .insert([
        {
          course_id: courseId,
          instructor_id: user.id,
          title,
          description,
          scheduled_start: scheduledStart,
          scheduled_end: scheduledEnd,
          daily_room_name: roomName,
          daily_room_url: `https://hamduk.daily.co/${roomName}`,
          is_recurring: isRecurring || false,
          recurrence_pattern: recurrencePattern,
          status: 'scheduled',
          max_participants: maxParticipants,
        },
      ]);

    if (error) throw error;

    // Audit log
    await createAuditLog({
      user_id: user.id,
      action: 'LIVE_SESSION_CREATED',
      resource_type: 'live_sessions',
      changes: { courseId, title, roomName },
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: 'Live session created',
      roomName,
    });
  } catch (error) {
    console.error('[Live Sessions POST Error]:', error);
    return NextResponse.json(
      { error: 'Failed to create live session' },
      { status: 500 }
    );
  }
}
