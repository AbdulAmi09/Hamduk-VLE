-- Hamduk VLE Row-Level Security (RLS) Policies
-- Phase 3: Security policies for multi-tenant access control

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid()::text = id::text);

-- Admins can view all users in their institution
CREATE POLICY "Admins can view institution users"
ON users FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'admin'
  AND institution_id = (
    SELECT institution_id FROM users WHERE id = auth.uid()::uuid
  )
);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid()::text = id::text);

-- ============================================
-- COURSES TABLE POLICIES
-- ============================================

-- Instructors can view their own courses
CREATE POLICY "Instructors can view own courses"
ON courses FOR SELECT
USING (instructor_id = auth.uid()::uuid);

-- Students can view enrolled courses
CREATE POLICY "Students can view enrolled courses"
ON courses FOR SELECT
USING (
  id IN (
    SELECT course_id FROM enrollments
    WHERE student_id = auth.uid()::uuid AND status = 'active'
  )
);

-- Admins can view all courses in their institution
CREATE POLICY "Admins can view institution courses"
ON courses FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'admin'
  AND institution_id = (
    SELECT institution_id FROM users WHERE id = auth.uid()::uuid
  )
);

-- Instructors can create courses
CREATE POLICY "Instructors can create courses"
ON courses FOR INSERT
WITH CHECK (
  auth.jwt() ->> 'role' = 'instructor'
  AND instructor_id = auth.uid()::uuid
);

-- Instructors can update their own courses
CREATE POLICY "Instructors can update own courses"
ON courses FOR UPDATE
USING (instructor_id = auth.uid()::uuid);

-- ============================================
-- ENROLLMENTS TABLE POLICIES
-- ============================================

-- Students can view their own enrollments
CREATE POLICY "Students can view own enrollments"
ON enrollments FOR SELECT
USING (student_id = auth.uid()::uuid);

-- Instructors can view enrollments in their courses
CREATE POLICY "Instructors can view course enrollments"
ON enrollments FOR SELECT
USING (
  course_id IN (
    SELECT id FROM courses WHERE instructor_id = auth.uid()::uuid
  )
);

-- Instructors can manage enrollments in their courses
CREATE POLICY "Instructors can manage enrollments"
ON enrollments FOR INSERT
WITH CHECK (
  course_id IN (
    SELECT id FROM courses WHERE instructor_id = auth.uid()::uuid
  )
);

CREATE POLICY "Instructors can update enrollments"
ON enrollments FOR UPDATE
USING (
  course_id IN (
    SELECT id FROM courses WHERE instructor_id = auth.uid()::uuid
  )
);

-- ============================================
-- LECTURES TABLE POLICIES
-- ============================================

-- Instructors can view lectures in their courses
CREATE POLICY "Instructors can view course lectures"
ON lectures FOR SELECT
USING (
  course_id IN (
    SELECT id FROM courses WHERE instructor_id = auth.uid()::uuid
  )
);

-- Students can view lectures in enrolled courses
CREATE POLICY "Students can view enrolled course lectures"
ON lectures FOR SELECT
USING (
  course_id IN (
    SELECT course_id FROM enrollments
    WHERE student_id = auth.uid()::uuid AND status = 'active'
  )
);

-- Instructors can create lectures
CREATE POLICY "Instructors can create lectures"
ON lectures FOR INSERT
WITH CHECK (
  course_id IN (
    SELECT id FROM courses WHERE instructor_id = auth.uid()::uuid
  )
);

-- Instructors can update lectures
CREATE POLICY "Instructors can update lectures"
ON lectures FOR UPDATE
USING (
  course_id IN (
    SELECT id FROM courses WHERE instructor_id = auth.uid()::uuid
  )
);

-- ============================================
-- ATTENDANCE TABLE POLICIES
-- ============================================

-- Students can view their own attendance
CREATE POLICY "Students can view own attendance"
ON attendance FOR SELECT
USING (student_id = auth.uid()::uuid);

-- Instructors can view attendance in their courses
CREATE POLICY "Instructors can view course attendance"
ON attendance FOR SELECT
USING (
  lecture_id IN (
    SELECT id FROM lectures
    WHERE course_id IN (
      SELECT id FROM courses WHERE instructor_id = auth.uid()::uuid
    )
  )
);

-- Students can update their own attendance
CREATE POLICY "Students can update own attendance"
ON attendance FOR UPDATE
USING (student_id = auth.uid()::uuid);

-- ============================================
-- ASSESSMENTS TABLE POLICIES
-- ============================================

-- Instructors can view assessments in their courses
CREATE POLICY "Instructors can view course assessments"
ON assessments FOR SELECT
USING (
  course_id IN (
    SELECT id FROM courses WHERE instructor_id = auth.uid()::uuid
  )
);

-- Students can view assessments in enrolled courses
CREATE POLICY "Students can view enrolled course assessments"
ON assessments FOR SELECT
USING (
  course_id IN (
    SELECT course_id FROM enrollments
    WHERE student_id = auth.uid()::uuid AND status = 'active'
  )
);

-- Instructors can create assessments
CREATE POLICY "Instructors can create assessments"
ON assessments FOR INSERT
WITH CHECK (
  course_id IN (
    SELECT id FROM courses WHERE instructor_id = auth.uid()::uuid
  )
);

-- ============================================
-- GRADES TABLE POLICIES
-- ============================================

-- Students can view their own grades
CREATE POLICY "Students can view own grades"
ON grades FOR SELECT
USING (student_id = auth.uid()::uuid);

-- Instructors can view grades in their courses
CREATE POLICY "Instructors can view course grades"
ON grades FOR SELECT
USING (
  assessment_id IN (
    SELECT id FROM assessments
    WHERE course_id IN (
      SELECT id FROM courses WHERE instructor_id = auth.uid()::uuid
    )
  )
);

-- Instructors can create and update grades
CREATE POLICY "Instructors can create grades"
ON grades FOR INSERT
WITH CHECK (
  assessment_id IN (
    SELECT id FROM assessments
    WHERE course_id IN (
      SELECT id FROM courses WHERE instructor_id = auth.uid()::uuid
    )
  )
);

CREATE POLICY "Instructors can update grades"
ON grades FOR UPDATE
USING (
  assessment_id IN (
    SELECT id FROM assessments
    WHERE course_id IN (
      SELECT id FROM courses WHERE instructor_id = auth.uid()::uuid
    )
  )
);
