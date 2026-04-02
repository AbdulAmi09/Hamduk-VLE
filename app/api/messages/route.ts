import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin, createAuditLog } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const recipientId = searchParams.get('recipientId');

    let query = supabase
      .from('direct_messages')
      .select('*, sender:profiles!sender_id(full_name, avatar_url), recipient:profiles!recipient_id(full_name, avatar_url)');

    if (recipientId) {
      query = query.or(
        `and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`
      );
    } else {
      query = query.or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);
    }

    const { data: messages, error } = await query
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Get unique conversations
    const conversations = new Map();
    messages?.forEach((msg) => {
      const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
      if (!conversations.has(otherId)) {
        conversations.set(otherId, msg);
      }
    });

    return NextResponse.json({
      messages,
      conversations: Array.from(conversations.values()),
    });
  } catch (error) {
    console.error('[Messages GET Error]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
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

    const { recipientId, message } = await req.json();

    if (!recipientId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create message
    const { error } = await supabaseAdmin
      .from('direct_messages')
      .insert([
        {
          sender_id: user.id,
          recipient_id: recipientId,
          message,
          is_read: false,
        },
      ]);

    if (error) throw error;

    // Audit log
    await createAuditLog({
      user_id: user.id,
      action: 'MESSAGE_SENT',
      resource_type: 'direct_messages',
      resource_id: recipientId,
      status: 'success',
    });

    // Notify recipient
    try {
      const { data: recipient } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', recipientId)
        .single();

      if (recipient) {
        // Could send notification here
      }
    } catch (err) {
      console.error('Error notifying recipient:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent',
    });
  } catch (error) {
    console.error('[Messages POST Error]:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
