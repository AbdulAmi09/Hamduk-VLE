import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const institutionId = searchParams.get('institutionId');
    const type = searchParams.get('type') || 'course'; // course, institution, global

    let query;

    if (type === 'course' && courseId) {
      query = supabase
        .from('v_student_course_summary')
        .select('student_id, course_gpa, lectures_attended, total_lectures')
        .eq('course_id', courseId)
        .order('course_gpa', { ascending: false })
        .limit(50);
    } else if (type === 'institution' && institutionId) {
      query = supabase
        .from('profiles')
        .select('id, full_name, avatar_url, xp_points, institution_id')
        .eq('institution_id', institutionId)
        .order('xp_points', { ascending: false })
        .limit(50);
    } else {
      // Global leaderboard
      query = supabase
        .from('profiles')
        .select('id, full_name, avatar_url, xp_points')
        .order('xp_points', { ascending: false })
        .limit(50);
    }

    const { data: leaderboard, error } = await query;

    if (error) throw error;

    // Add ranking
    const rankedLeaderboard = leaderboard?.map((item, index) => ({
      ...item,
      rank: index + 1,
    })) || [];

    return NextResponse.json({
      leaderboard: rankedLeaderboard,
      total: rankedLeaderboard.length,
    });
  } catch (error) {
    console.error('[Leaderboard Error]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
