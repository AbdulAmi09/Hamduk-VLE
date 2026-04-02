import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userRole } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userRole?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get dashboard metrics
    const [users, courses, assessments, institutions] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact' }),
      supabase.from('courses').select('id', { count: 'exact' }),
      supabase.from('assessments').select('id', { count: 'exact' }),
      supabase.from('institutions').select('id', { count: 'exact' }),
    ]);

    // Get recent activity
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    // Get payment stats
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(100);

    const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    return NextResponse.json({
      metrics: {
        totalUsers: users[3] || 0,
        totalCourses: courses[3] || 0,
        totalAssessments: assessments[3] || 0,
        totalInstitutions: institutions[3] || 0,
        totalRevenue,
        paymentsCount: payments?.length || 0,
      },
      recentActivity: auditLogs,
      paymentStats: {
        total: payments?.length || 0,
        average: payments && payments.length > 0
          ? (totalRevenue / payments.length).toFixed(2)
          : 0,
      },
    });
  } catch (error) {
    console.error('[Admin Dashboard Error]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard' },
      { status: 500 }
    );
  }
}
