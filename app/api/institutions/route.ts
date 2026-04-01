import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin, createAuditLog } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get institutions for user
    const { data: institutions, error } = await supabase
      .from('institutions')
      .select('*, users:users(count)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ institutions });
  } catch (error) {
    console.error('[Institutions GET Error]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch institutions' },
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

    const { name, country } = await req.json();

    if (!name || !country) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create institution
    const { data: institution, error } = await supabaseAdmin
      .from('institutions')
      .insert([{ name, country }])
      .select('*')
      .single();

    if (error) throw error;

    // Add user as admin
    const { error: adminError } = await supabaseAdmin
      .from('institution_admins')
      .insert([
        {
          institution_id: institution.id,
          user_id: user.id,
          role: 'super_admin',
          permissions: ['manage_users', 'manage_courses', 'view_analytics'],
        },
      ]);

    if (adminError) {
      // Clean up if admin assignment fails
      await supabaseAdmin
        .from('institutions')
        .delete()
        .eq('id', institution.id);

      throw adminError;
    }

    // Audit log
    await createAuditLog({
      user_id: user.id,
      action: 'INSTITUTION_CREATED',
      resource_type: 'institutions',
      resource_id: institution.id,
      changes: { name, country },
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      institution,
      message: 'Institution created',
    });
  } catch (error) {
    console.error('[Institutions POST Error]:', error);
    return NextResponse.json(
      { error: 'Failed to create institution' },
      { status: 500 }
    );
  }
}
