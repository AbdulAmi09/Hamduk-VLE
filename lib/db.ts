import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// Initialize database tables if they don't exist
export async function initializeTables() {
  try {
    // Check if tables exist by querying information_schema
    const { data: tables } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (!tables || tables.length < 30) {
      console.log('[DB] Tables need to be created');
      // Migration will be run separately via SQL
    }

    return true;
  } catch (error) {
    console.error('[DB] Error checking tables:', error);
    return false;
  }
}

// Type definitions for all new tables
export interface TwoFactorAuth {
  id: string;
  user_id: string;
  secret_key: string;
  is_verified: boolean;
  verified_at?: string;
  backup_codes: string[];
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  token_hash: string;
  user_agent?: string;
  ip_address?: string;
  last_activity: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface LoginAttempt {
  id: string;
  email: string;
  ip_address: string;
  user_agent?: string;
  success: boolean;
  reason?: string;
  attempted_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_id?: string;
  related_type?: string;
  read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_on_announcements: boolean;
  email_on_grades: boolean;
  email_on_messages: boolean;
  email_on_live_sessions: boolean;
  email_on_discussions: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  digest_mode: boolean;
  digest_frequency: string;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  course_id?: string;
  institution_id?: string;
  instructor_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  visibility: string;
  posted_date: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Discussion {
  id: string;
  lecture_id: string;
  course_id: string;
  user_id: string;
  title: string;
  content: string;
  is_question: boolean;
  is_answered: boolean;
  reply_count: number;
  created_at: string;
  updated_at: string;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LiveSession {
  id: string;
  course_id: string;
  instructor_id: string;
  title: string;
  description?: string;
  scheduled_start: string;
  scheduled_end: string;
  daily_room_name?: string;
  daily_room_url?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  actual_start?: string;
  actual_end?: string;
  status: string;
  max_participants?: number;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  badge_type: string;
  xp_reward: number;
  criteria?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  student_id: string;
  course_id: string;
  certificate_number: string;
  issue_date: string;
  expiry_date?: string;
  certificate_url?: string;
  verification_token: string;
  public_url?: string;
  is_revoked: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  changes?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  status: string;
  error_message?: string;
  created_at: string;
}

// Database helper functions
export async function createAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>) {
  const { error } = await supabaseAdmin.from('audit_logs').insert([log]);
  if (error) console.error('[DB] Audit log error:', error);
  return !error;
}

export async function getNotifications(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId);

  return !error;
}

export async function createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) {
  const { error } = await supabaseAdmin
    .from('notifications')
    .insert([notification]);

  return !error;
}

export async function getUserBadges(userId: string) {
  const { data, error } = await supabase
    .from('user_badges')
    .select('*, badges(*)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  return { data, error };
}

export async function awardBadge(userId: string, badgeId: string) {
  const { error } = await supabaseAdmin
    .from('user_badges')
    .insert([{ user_id: userId, badge_id: badgeId }]);

  return !error;
}

export async function updateUserXP(userId: string, xpToAdd: number) {
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('xp_points')
    .eq('id', userId)
    .single();

  const newXP = (currentProfile?.xp_points || 0) + xpToAdd;

  const { error } = await supabase
    .from('profiles')
    .update({ xp_points: newXP })
    .eq('id', userId);

  return !error;
}

export async function getLeaderboard(courseId: string, limit = 50) {
  const { data, error } = await supabase
    .from('v_student_course_summary')
    .select('student_id, course_gpa')
    .eq('course_id', courseId)
    .order('course_gpa', { ascending: false })
    .limit(limit);

  return { data, error };
}
