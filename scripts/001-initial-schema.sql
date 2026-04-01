-- Hamduk VLE Complete Database Schema

-- ============================================================================
-- 1. CORE TABLES
-- ============================================================================

-- Users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  display_name VARCHAR(255),
  bio TEXT,
  profile_photo_url VARCHAR(500),
  role VARCHAR(50) DEFAULT 'student', -- student, tutor, school_admin, platform_admin
  country VARCHAR(100),
  timezone VARCHAR(50),
  language_preference VARCHAR(10) DEFAULT 'en',
  profile_visibility VARCHAR(20) DEFAULT 'private', -- private, public
  
  -- Social links
  linkedin_url VARCHAR(500),
  twitter_url VARCHAR(500),
  website_url VARCHAR(500),
  
  -- Account status
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Institutions/Schools table
CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500),
  description TEXT,
  country VARCHAR(100),
  website VARCHAR(500),
  subdomain VARCHAR(100) UNIQUE,
  custom_domain VARCHAR(255) UNIQUE,
  branding_color VARCHAR(10),
  
  -- Billing
  plan VARCHAR(50) DEFAULT 'enterprise', -- free, pro, enterprise
  status VARCHAR(50) DEFAULT 'active', -- active, suspended, deleted
  
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Institution members/staff
CREATE TABLE IF NOT EXISTS public.institution_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- admin, tutor, student
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_suspended BOOLEAN DEFAULT false,
  joined_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(institution_id, user_id)
);

-- ============================================================================
-- 2. AUTHENTICATION & SECURITY
-- ============================================================================

-- Two-Factor Authentication
CREATE TABLE IF NOT EXISTS public.two_factor_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  secret_key VARCHAR(255),
  is_enabled BOOLEAN DEFAULT false,
  backup_codes VARCHAR(500)[], -- array of backup codes
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Session tracking
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  device_name VARCHAR(255),
  browser VARCHAR(100),
  os VARCHAR(100),
  ip_address VARCHAR(50),
  location VARCHAR(255),
  last_active TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(user_id, session_id)
);

-- Login history & audit
CREATE TABLE IF NOT EXISTS public.login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  ip_address VARCHAR(50),
  device_name VARCHAR(255),
  location VARCHAR(255),
  is_successful BOOLEAN,
  failure_reason VARCHAR(255),
  is_suspicious BOOLEAN DEFAULT false,
  login_at TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- 3. CLASSES & COURSES
-- ============================================================================

-- Classes/Courses
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_url VARCHAR(500),
  category VARCHAR(100), -- Academic, Language, Music, Art, Sports, Fitness, Tech, Chess, Cooking, Other
  class_code VARCHAR(10) UNIQUE,
  trailer_video_url VARCHAR(500),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  max_enrollment INTEGER DEFAULT 50,
  status VARCHAR(20) DEFAULT 'draft', -- draft, active, archived
  visibility VARCHAR(20) DEFAULT 'invite_only', -- invite_only, open
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Class enrollments
CREATE TABLE IF NOT EXISTS public.class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES public.users(id),
  enrollment_status VARCHAR(20) DEFAULT 'enrolled', -- enrolled, waitlisted, suspended
  enrolled_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(class_id, student_id)
);

-- Class tutors assignment
CREATE TABLE IF NOT EXISTS public.class_tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(class_id, tutor_id)
);

-- ============================================================================
-- 4. CONTENT & LESSONS
-- ============================================================================

-- Modules/Sections
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- Lessons
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url VARCHAR(500),
  video_type VARCHAR(20), -- upload, youtube, vimeo
  video_duration_seconds INTEGER,
  captions_url VARCHAR(500),
  order_index INTEGER DEFAULT 0,
  unlock_date TIMESTAMP,
  drip_enabled BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Lesson progress tracking
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  watch_percentage DECIMAL(5,2) DEFAULT 0,
  watch_time_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  last_watched_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  UNIQUE(lesson_id, student_id),
  FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Lesson notes
CREATE TABLE IF NOT EXISTS public.lesson_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER,
  note_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- 5. LIVE CLASSES & SESSIONS
-- ============================================================================

-- Live sessions
CREATE TABLE IF NOT EXISTS public.live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  session_date TIMESTAMP NOT NULL,
  duration_minutes INTEGER,
  recurrence VARCHAR(50), -- none, weekly, custom
  daily_room_id VARCHAR(255),
  recording_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, live, completed, cancelled
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Live session attendees
CREATE TABLE IF NOT EXISTS public.live_session_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  join_time TIMESTAMP,
  leave_time TIMESTAMP,
  is_present BOOLEAN DEFAULT false,
  
  UNIQUE(session_id, user_id)
);

-- ============================================================================
-- 6. ASSIGNMENTS & SUBMISSIONS
-- ============================================================================

-- Assignments
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,
  reference_file_url VARCHAR(500),
  due_date TIMESTAMP NOT NULL,
  allow_late_submission BOOLEAN DEFAULT false,
  submission_type VARCHAR(50), -- text, file, both
  allowed_file_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  max_file_size_mb INTEGER DEFAULT 10,
  marks_available INTEGER DEFAULT 100,
  weight DECIMAL(5,2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Assignment submissions
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  submission_text TEXT,
  file_url VARCHAR(500),
  submitted_at TIMESTAMP DEFAULT now(),
  is_late BOOLEAN DEFAULT false,
  
  UNIQUE(assignment_id, student_id)
);

-- Assignment grading
CREATE TABLE IF NOT EXISTS public.assignment_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.assignment_submissions(id) ON DELETE CASCADE,
  graded_by UUID NOT NULL REFERENCES public.users(id),
  score INTEGER,
  feedback_text TEXT,
  annotated_file_url VARCHAR(500),
  allow_resubmission BOOLEAN DEFAULT false,
  graded_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(submission_id)
);

-- ============================================================================
-- 7. QUIZZES & ASSESSMENTS
-- ============================================================================

-- Quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,
  time_limit_minutes INTEGER,
  attempts_allowed INTEGER DEFAULT 1, -- 1, 2, unlimited
  passing_percentage INTEGER DEFAULT 60,
  show_correct_answers VARCHAR(50) DEFAULT 'never', -- immediately, after_due, never
  prevent_tab_switch BOOLEAN DEFAULT false,
  
  available_from TIMESTAMP,
  available_until TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Quiz questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_type VARCHAR(50) NOT NULL, -- multiple_choice, multiple_select, true_false, short_answer, essay, fill_blank, matching
  question_text TEXT NOT NULL,
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  
  -- Options for multiple choice/select
  options JSONB, -- [{text, is_correct}, ...]
  
  created_at TIMESTAMP DEFAULT now()
);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  attempt_number INTEGER DEFAULT 1,
  score INTEGER,
  percentage DECIMAL(5,2),
  started_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP,
  time_spent_seconds INTEGER
);

-- Quiz answers
CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  is_correct BOOLEAN,
  points_earned INTEGER,
  flagged BOOLEAN DEFAULT false
);

-- ============================================================================
-- 8. GRADEBOOK
-- ============================================================================

-- Grades (aggregated)
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assessment_id UUID, -- reference to assignment or quiz
  assessment_type VARCHAR(50), -- assignment, quiz
  score DECIMAL(5,2),
  percentage DECIMAL(5,2),
  final_grade VARCHAR(2), -- A, B, C, D, F
  is_overridden BOOLEAN DEFAULT false,
  override_reason TEXT,
  
  UNIQUE(class_id, student_id, assessment_id)
);

-- ============================================================================
-- 9. ATTENDANCE
-- ============================================================================

-- Attendance records
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID, -- NULL if manual entry
  date TIMESTAMP NOT NULL,
  is_present BOOLEAN DEFAULT false,
  is_manual_override BOOLEAN DEFAULT false,
  override_note TEXT,
  
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- 10. NOTIFICATIONS
-- ============================================================================

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(100), -- lesson_available, class_reminder, assignment_due, grade_released, etc.
  related_resource_id UUID,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT now()
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  notification_type VARCHAR(100),
  in_app_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  
  UNIQUE(user_id, notification_type)
);

-- ============================================================================
-- 11. COMMUNICATION
-- ============================================================================

-- Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  audience VARCHAR(50), -- all_students, all_tutors, specific
  expires_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT now()
);

-- Announcement read receipts
CREATE TABLE IF NOT EXISTS public.announcement_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(announcement_id, user_id)
);

-- Discussions (lesson-level)
CREATE TABLE IF NOT EXISTS public.discussion_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Discussion replies
CREATE TABLE IF NOT EXISTS public.discussion_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id),
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_answer BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Direct messages
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  file_url VARCHAR(500),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- 12. GAMIFICATION
-- ============================================================================

-- User gamification stats
CREATE TABLE IF NOT EXISTS public.gamification_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity TIMESTAMP,
  
  UNIQUE(user_id, class_id)
);

-- XP transactions
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id),
  xp_amount INTEGER NOT NULL,
  reason VARCHAR(100), -- lesson_completed, on_time_submission, live_attendance, quiz_pass, daily_login
  
  created_at TIMESTAMP DEFAULT now()
);

-- Badges
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  requirement TEXT
);

-- User badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(user_id, badge_id)
);

-- Leaderboards
CREATE TABLE IF NOT EXISTS public.leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rank INTEGER,
  total_xp INTEGER,
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(class_id, user_id)
);

-- ============================================================================
-- 13. CERTIFICATES
-- ============================================================================

-- Certificates
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  certificate_number VARCHAR(50) UNIQUE,
  issue_date TIMESTAMP DEFAULT now(),
  pdf_url VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- 14. ROLES & PERMISSIONS
-- ============================================================================

-- RBAC Policies will be handled via Row Level Security (RLS)

-- ============================================================================
-- 15. PLATFORM ADMIN
-- ============================================================================

-- Feature flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name VARCHAR(100) NOT NULL UNIQUE,
  tier VARCHAR(50), -- free, pro, enterprise, all
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  changes JSONB,
  ip_address VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_institution_members_institution ON public.institution_members(institution_id);
CREATE INDEX idx_institution_members_user ON public.institution_members(user_id);
CREATE INDEX idx_classes_institution ON public.classes(institution_id);
CREATE INDEX idx_classes_created_by ON public.classes(created_by);
CREATE INDEX idx_class_enrollments_class ON public.class_enrollments(class_id);
CREATE INDEX idx_class_enrollments_student ON public.class_enrollments(student_id);
CREATE INDEX idx_lessons_module ON public.lessons(module_id);
CREATE INDEX idx_lesson_progress_lesson ON public.lesson_progress(lesson_id);
CREATE INDEX idx_lesson_progress_student ON public.lesson_progress(student_id);
CREATE INDEX idx_live_sessions_class ON public.live_sessions(class_id);
CREATE INDEX idx_assignments_class ON public.assignments(class_id);
CREATE INDEX idx_assignment_submissions_assignment ON public.assignment_submissions(assignment_id);
CREATE INDEX idx_assignment_submissions_student ON public.assignment_submissions(student_id);
CREATE INDEX idx_quizzes_class ON public.quizzes(class_id);
CREATE INDEX idx_quiz_attempts_student ON public.quiz_attempts(student_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);
CREATE INDEX idx_announcements_class ON public.announcements(class_id);
CREATE INDEX idx_gamification_stats_user ON public.gamification_stats(user_id);
CREATE INDEX idx_certificates_student ON public.certificates(student_id);
CREATE INDEX idx_attendance_student ON public.attendance(student_id);
CREATE INDEX idx_attendance_class ON public.attendance(class_id);
CREATE INDEX idx_login_history_user ON public.login_history(user_id);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_live_sessions_updated_at BEFORE UPDATE ON public.live_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussion_threads_updated_at BEFORE UPDATE ON public.discussion_threads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussion_replies_updated_at BEFORE UPDATE ON public.discussion_replies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
