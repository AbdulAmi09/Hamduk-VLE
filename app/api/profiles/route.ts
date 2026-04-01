import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin, createAuditLog } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const isPublic = searchParams.get('public') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    if (isPublic) {
      // Get only public profile info
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio, xp_points, badges, role, institution_id')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return NextResponse.json({ profile });
    } else {
      // Get full profile - only if authenticated as same user or admin
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (user.id !== userId) {
        // Check if admin
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
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return NextResponse.json({ profile });
    }
  } catch (error) {
    console.error('[Profiles GET Error]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, ...updates } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Verify user can update this profile
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    // Audit log
    await createAuditLog({
      user_id: user.id,
      action: 'PROFILE_UPDATED',
      resource_type: 'profiles',
      resource_id: userId,
      changes: updates,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('[Profiles PUT Error]:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
