import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin, createNotification, getNotifications } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await getNotifications(user.id, 50);

    if (error) throw error;

    // Count unread
    const unreadCount = data?.filter((n) => !n.read).length || 0;

    return NextResponse.json({
      notifications: data,
      unreadCount,
    });
  } catch (error) {
    console.error('[Notifications GET Error]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      type,
      title,
      message,
      relatedId,
      relatedType,
      sendEmail,
      userEmail,
    } = await req.json();

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create in-app notification
    const success = await createNotification({
      user_id: userId,
      type,
      title,
      message,
      related_id: relatedId,
      related_type: relatedType,
      read: false,
    });

    if (!success) {
      throw new Error('Failed to create notification');
    }

    // Send email if requested and preferences allow
    if (sendEmail && userEmail) {
      try {
        const { data: prefs } = await supabaseAdmin
          .from('notification_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();

        const shouldSendEmail =
          prefs &&
          (
            (type === 'grade' && prefs.email_on_grades) ||
            (type === 'announcement' && prefs.email_on_announcements) ||
            (type === 'message' && prefs.email_on_messages) ||
            (type === 'live_session' && prefs.email_on_live_sessions) ||
            (type === 'discussion' && prefs.email_on_discussions)
          );

        if (shouldSendEmail) {
          await resend.emails.send({
            from: 'notifications@hamduk-vle.com',
            to: userEmail,
            subject: title,
            html: `<p>${message}</p>`,
          });
        }
      } catch (emailError) {
        console.error('[Email Send Error]:', emailError);
        // Don't fail the whole request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Notification created',
    });
  } catch (error) {
    console.error('[Notifications POST Error]:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
