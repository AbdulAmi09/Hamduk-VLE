-- ============================================================================
-- CRITICAL FIXES MIGRATION
-- Addresses all known issues from Phase 0 review
-- ============================================================================

-- 1. Add modules table (was missing)
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_order ON modules(course_id, order_index);

-- 2. Fix lessons to reference modules instead of courses
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES modules(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);

-- 3. Rename two_factor_settings to two_factor_auth if needed
-- (No rename needed, but ensure table exists and has correct schema)
ALTER TABLE IF EXISTS two_factor_auth
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS backup_codes TEXT[] DEFAULT '{}';

-- 4. Ensure profiles.user_id references auth.users correctly
-- Add missing columns to profiles if they exist elsewhere
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS profile_visibility VARCHAR(20) DEFAULT 'private',
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE;

-- 5. Enable RLS on critical tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'platform_admin')
  )
);

-- 7. RLS Policies for classes
DROP POLICY IF EXISTS "Users can view classes they belong to" ON classes;
CREATE POLICY "Users can view classes they belong to" ON classes
FOR SELECT USING (
  auth.uid() = created_by OR
  auth.uid() IN (
    SELECT student_id FROM enrollments WHERE class_id = classes.id
  ) OR
  auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'platform_admin')
  )
);

DROP POLICY IF EXISTS "Instructors can update their classes" ON classes;
CREATE POLICY "Instructors can update their classes" ON classes
FOR UPDATE USING (auth.uid() = created_by);

-- 8. RLS Policies for modules
DROP POLICY IF EXISTS "Users can view modules of accessible classes" ON modules;
CREATE POLICY "Users can view modules of accessible classes" ON modules
FOR SELECT USING (
  course_id IN (
    SELECT id FROM classes WHERE 
      auth.uid() = created_by OR
      auth.uid() IN (SELECT student_id FROM enrollments WHERE class_id = classes.id) OR
      auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'platform_admin'))
  )
);

-- 9. RLS Policies for lessons
DROP POLICY IF EXISTS "Users can view lessons of accessible modules" ON lessons;
CREATE POLICY "Users can view lessons of accessible modules" ON lessons
FOR SELECT USING (
  module_id IN (
    SELECT id FROM modules WHERE course_id IN (
      SELECT id FROM classes WHERE 
        auth.uid() = created_by OR
        auth.uid() IN (SELECT student_id FROM enrollments WHERE class_id = classes.id) OR
        auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'platform_admin'))
    )
  )
);

-- 10. RLS Policies for payments
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments" ON payments
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
CREATE POLICY "Admins can view all payments" ON payments
FOR SELECT USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'platform_admin')
  )
);

-- 11. RLS Policies for announcements
DROP POLICY IF EXISTS "Users can view announcements of their classes" ON announcements;
CREATE POLICY "Users can view announcements of their classes" ON announcements
FOR SELECT USING (
  class_id IN (
    SELECT id FROM classes WHERE 
      auth.uid() = created_by OR
      auth.uid() IN (SELECT student_id FROM enrollments WHERE class_id = classes.id) OR
      auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'platform_admin'))
  )
);

-- 12. RLS Policies for discussions
DROP POLICY IF EXISTS "Users can view discussions of their classes" ON discussions;
CREATE POLICY "Users can view discussions of their classes" ON discussions
FOR SELECT USING (
  class_id IN (
    SELECT id FROM classes WHERE 
      auth.uid() = created_by OR
      auth.uid() IN (SELECT student_id FROM enrollments WHERE class_id = classes.id) OR
      auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'platform_admin'))
  )
);

DROP POLICY IF EXISTS "Users can create discussions in their classes" ON discussions;
CREATE POLICY "Users can create discussions in their classes" ON discussions
FOR INSERT WITH CHECK (
  class_id IN (
    SELECT id FROM classes WHERE 
      auth.uid() = created_by OR
      auth.uid() IN (SELECT student_id FROM enrollments WHERE class_id = classes.id) OR
      auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'platform_admin'))
  ) AND
  user_id = auth.uid()
);

-- 13. RLS Policies for live_sessions
DROP POLICY IF EXISTS "Users can view live sessions of their classes" ON live_sessions;
CREATE POLICY "Users can view live sessions of their classes" ON live_sessions
FOR SELECT USING (
  class_id IN (
    SELECT id FROM classes WHERE 
      auth.uid() = created_by OR
      auth.uid() IN (SELECT student_id FROM enrollments WHERE class_id = classes.id) OR
      auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'platform_admin'))
  )
);

-- 14. RLS Policies for certificates
DROP POLICY IF EXISTS "Users can view own certificates" ON certificates;
CREATE POLICY "Users can view own certificates" ON certificates
FOR SELECT USING (auth.uid() = issued_to_user_id);

DROP POLICY IF EXISTS "Admins can view all certificates" ON certificates;
CREATE POLICY "Admins can view all certificates" ON certificates
FOR SELECT USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'platform_admin')
  )
);

-- 15. RLS Policies for badges
DROP POLICY IF EXISTS "Users can view own badges" ON badges;
CREATE POLICY "Users can view own badges" ON badges
FOR SELECT USING (auth.uid() = user_id);

-- 16. RLS Policies for two_factor_auth
DROP POLICY IF EXISTS "Users can view own 2FA settings" ON two_factor_auth;
CREATE POLICY "Users can view own 2FA settings" ON two_factor_auth
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own 2FA settings" ON two_factor_auth;
CREATE POLICY "Users can update own 2FA settings" ON two_factor_auth
FOR UPDATE USING (auth.uid() = user_id);

-- 17. RLS Policies for audit_logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs
FOR SELECT USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'platform_admin')
  )
);

-- 18. Ensure enrollments has proper RLS
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view enrollments they belong to" ON enrollments;
CREATE POLICY "Users can view enrollments they belong to" ON enrollments
FOR SELECT USING (
  auth.uid() = student_id OR
  class_id IN (
    SELECT id FROM classes WHERE auth.uid() = created_by
  ) OR
  auth.uid() IN (
    SELECT id FROM profiles WHERE role IN ('admin', 'platform_admin')
  )
);

-- 19. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_classes_created_by ON classes(created_by);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class_id ON enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_class_id ON announcements(class_id);
CREATE INDEX IF NOT EXISTS idx_discussions_class_id ON discussions(class_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_class_id ON live_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_certificates_issued_to ON certificates(issued_to_user_id);
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_auth_user_id ON two_factor_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- 20. Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop and recreate the trigger to ensure it's correct
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();

-- 21. Ensure lesson_progress table exists
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);

-- Enable RLS on lesson_progress
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own progress" ON lesson_progress;
CREATE POLICY "Users can view own progress" ON lesson_progress
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Instructors can view student progress" ON lesson_progress;
CREATE POLICY "Instructors can view student progress" ON lesson_progress
FOR SELECT USING (
  lesson_id IN (
    SELECT id FROM lessons WHERE course_id IN (
      SELECT id FROM classes WHERE auth.uid() = created_by
    )
  )
);

-- ============================================================================
-- END CRITICAL FIXES
-- ============================================================================
