import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, createAuditLog } from '@/lib/db';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Check if user already has 2FA
    const { data: existing } = await supabaseAdmin
      .from('two_factor_auth')
      .select('id')
      .eq('user_id', userId)
      .single();

    // Generate new secret
    const secret = speakeasy.generateSecret({
      name: `Hamduk VLE (${userId})`,
      issuer: 'Hamduk VLE',
      length: 32,
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    if (existing) {
      // Update existing
      const { error } = await supabaseAdmin
        .from('two_factor_auth')
        .update({
          secret_key: secret.base32,
          is_verified: false,
          backup_codes: backupCodes,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      // Create new
      const { error } = await supabaseAdmin
        .from('two_factor_auth')
        .insert([
          {
            user_id: userId,
            secret_key: secret.base32,
            is_verified: false,
            backup_codes: backupCodes,
          },
        ]);

      if (error) throw error;
    }

    // Audit log
    await createAuditLog({
      user_id: userId,
      action: '2FA_SETUP_INITIATED',
      resource_type: 'two_factor_auth',
      resource_id: userId,
      status: 'success',
    });

    return NextResponse.json({
      secret: secret.base32,
      qrCode,
      backupCodes,
    });
  } catch (error) {
    console.error('[2FA Setup Error]:', error);
    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}
