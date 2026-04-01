import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get login history for the user's email
    const { data: loginHistory, error } = await supabase
      .from('login_attempts')
      .select('*')
      .eq('email', user.email)
      .order('attempted_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Group by success/failure
    const successful = loginHistory?.filter((l) => l.success) || [];
    const failed = loginHistory?.filter((l) => !l.success) || [];

    return NextResponse.json({
      total: loginHistory?.length || 0,
      successful: successful.length,
      failed: failed.length,
      recentLogins: successful.slice(0, 10).map((l) => ({
        ip_address: l.ip_address,
        user_agent: l.user_agent,
        attempted_at: l.attempted_at,
      })),
      failedAttempts: failed.slice(0, 10).map((l) => ({
        ip_address: l.ip_address,
        reason: l.reason,
        attempted_at: l.attempted_at,
      })),
    });
  } catch (error) {
    console.error('[Login History Error]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch login history' },
      { status: 500 }
    );
  }
}
