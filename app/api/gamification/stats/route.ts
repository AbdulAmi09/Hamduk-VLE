import { NextRequest, NextResponse } from 'next/server';
import { supabase, getUserBadges } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile (XP points)
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp_points')
      .eq('id', user.id)
      .single();

    // Get user badges
    const { data: badges, error: badgesError } = await getUserBadges(user.id);

    if (badgesError) throw badgesError;

    // Get user streak
    const { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get level based on XP (every 1000 XP = 1 level)
    const xp = profile?.xp_points || 0;
    const level = Math.floor(xp / 1000) + 1;
    const nextLevelXP = level * 1000;
    const currentLevelProgress = xp % 1000;

    return NextResponse.json({
      xp,
      level,
      nextLevelXP,
      currentLevelProgress,
      streak: {
        current: streak?.current_streak || 0,
        longest: streak?.longest_streak || 0,
        lastActivity: streak?.last_activity_date,
      },
      badges: badges || [],
      totalBadges: badges?.length || 0,
    });
  } catch (error) {
    console.error('[Gamification Stats Error]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
