import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, createAuditLog } from '@/lib/db';
import { speakeasy } from 'speakeasy';

export async function POST(req: NextRequest) {
  try {
    const { userId, token } = await req.json();

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'Missing userId or token' },
        { status: 400 }
      );
    }

    // Get the 2FA secret
    const { data: twoFactor, error: fetchError } = await supabaseAdmin
      .from('two_factor_auth')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError || !twoFactor) {
      return NextResponse.json(
        { error: '2FA not setup' },
        { status: 404 }
      );
    }

    // Verify TOTP token
    const verified = speakeasy.totp.verify({
      secret: twoFactor.secret_key,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      // Log failed attempt
      await createAuditLog({
        user_id: userId,
        action: '2FA_VERIFICATION_FAILED',
        resource_type: 'two_factor_auth',
        resource_id: userId,
        status: 'failure',
      });

      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Mark as verified
    const { error: updateError } = await supabaseAdmin
      .from('two_factor_auth')
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Audit log
    await createAuditLog({
      user_id: userId,
      action: '2FA_ENABLED',
      resource_type: 'two_factor_auth',
      resource_id: userId,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      message: '2FA verified and enabled',
    });
  } catch (error) {
    console.error('[2FA Verify Error]:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA' },
      { status: 500 }
    );
  }
}
