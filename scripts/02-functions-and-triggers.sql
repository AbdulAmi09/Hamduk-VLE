-- Hamduk VLE Database Functions and Triggers
-- Phase 2: Advanced database functions, triggers, and views

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: Calculate student attendance percentage
CREATE OR REPLACE FUNCTION calculate_attendance_percentage(p_student_id UUID, p_course_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_lectures INT;
  attended_lectures INT;
  attendance_percentage DECIMAL;
BEGIN
  SELECT COUNT(*) INTO total_lectures
  FROM lectures
  WHERE course_id = p_course_id;

  SELECT COUNT(*) INTO attended_lectures
  FROM attendance a
  JOIN lectures l ON a.lecture_id = l.id
  WHERE a.student_id = p_student_id
    AND l.course_id = p_course_id
    AND a.attended = true;

  IF total_lectures = 0 THEN
    RETURN 0;
  END IF;

  attendance_percentage := (attended_lectures::DECIMAL / total_lectures) * 100;
  RETURN ROUND(attendance_percentage, 2);
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate course GPA for a student
CREATE OR REPLACE FUNCTION calculate_course_gpa(p_student_id UUID, p_course_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_score DECIMAL;
  total_points INT;
  gpa DECIMAL;
BEGIN
  SELECT COALESCE(SUM(g.score), 0), COALESCE(SUM(a.total_points), 0)
  INTO total_score, total_points
  FROM grades g
  JOIN assessments a ON g.assessment_id = a.id
  WHERE g.student_id = p_student_id
    AND a.course_id = p_course_id
    AND g.graded_at IS NOT NULL;

  IF total_points = 0 THEN
    RETURN 0;
  END IF;

  gpa := (total_score / total_points) * 100;
  RETURN ROUND(gpa, 2);
END;
$$ LANGUAGE plpgsql;

-- Function: Get student course progress
CREATE OR REPLACE FUNCTION get_student_progress(p_student_id UUID, p_course_id UUID)
RETURNS TABLE (
  lectures_completed INT,
  total_lectures INT,
  assessments_submitted INT,
  total_assessments INT,
  average_score DECIMAL,
  attendance_percentage DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(COUNT(DISTINCT CASE WHEN a.attended THEN a.lecture_id END), 0)::INT,
    COALESCE(COUNT(DISTINCT l.id), 0)::INT,
    COALESCE(COUNT(DISTINCT CASE WHEN g.submitted_at IS NOT NULL THEN g.id END), 0)::INT,
    COALESCE(COUNT(DISTINCT a2.id), 0)::INT,
    COALESCE(AVG(g.score), 0)::DECIMAL,
    calculate_attendance_percentage(p_student_id, p_course_id)
  FROM lectures l
  LEFT JOIN attendance a ON l.id = a.lecture_id AND a.student_id = p_student_id
  LEFT JOIN assessments a2 ON a2.course_id = p_course_id
  LEFT JOIN grades g ON g.assessment_id = a2.id AND g.student_id = p_student_id
  WHERE l.course_id = p_course_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-mark attendance based on watch duration
CREATE OR REPLACE FUNCTION auto_mark_attendance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.watched_duration_minutes >= (
    SELECT (duration_minutes * 0.75)::INT
    FROM lectures
    WHERE id = NEW.lecture_id
  ) THEN
    NEW.attended := true;
    NEW.marked_at := CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update course updated_at timestamp
CREATE OR REPLACE FUNCTION update_course_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update user updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Validate enrollment status
CREATE OR REPLACE FUNCTION validate_enrollment_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('active', 'dropped', 'completed') THEN
    RAISE EXCEPTION 'Invalid enrollment status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Get course statistics
CREATE OR REPLACE FUNCTION get_course_statistics(p_course_id UUID)
RETURNS TABLE (
  total_students INT,
  total_lectures INT,
  total_assessments INT,
  average_attendance DECIMAL,
  average_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(COUNT(DISTINCT e.student_id), 0)::INT,
    COALESCE(COUNT(DISTINCT l.id), 0)::INT,
    COALESCE(COUNT(DISTINCT a.id), 0)::INT,
    COALESCE(AVG(att.watched_duration_minutes::DECIMAL / l.duration_minutes * 100), 0)::DECIMAL,
    COALESCE(AVG(g.score), 0)::DECIMAL
  FROM courses c
  LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
  LEFT JOIN lectures l ON c.id = l.course_id
  LEFT JOIN attendance att ON l.id = att.lecture_id
  LEFT JOIN assessments a ON c.id = a.course_id
  LEFT JOIN grades g ON a.id = g.assessment_id
  WHERE c.id = p_course_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Auto-mark attendance when watch duration reaches 75%
DROP TRIGGER IF EXISTS trigger_auto_mark_attendance ON attendance;
CREATE TRIGGER trigger_auto_mark_attendance
BEFORE INSERT OR UPDATE ON attendance
FOR EACH ROW
EXECUTE FUNCTION auto_mark_attendance();

-- Trigger: Update course timestamp on modification
DROP TRIGGER IF EXISTS trigger_update_course_timestamp ON courses;
CREATE TRIGGER trigger_update_course_timestamp
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION update_course_timestamp();

-- Trigger: Update user timestamp on modification
DROP TRIGGER IF EXISTS trigger_update_user_timestamp ON users;
CREATE TRIGGER trigger_update_user_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_user_timestamp();

-- Trigger: Validate enrollment status
DROP TRIGGER IF EXISTS trigger_validate_enrollment_status ON enrollments;
CREATE TRIGGER trigger_validate_enrollment_status
BEFORE INSERT OR UPDATE ON enrollments
FOR EACH ROW
EXECUTE FUNCTION validate_enrollment_status();

-- ============================================
-- VIEWS
-- ============================================

-- View: Student course summary
CREATE OR REPLACE VIEW v_student_course_summary AS
SELECT
  e.student_id,
  c.id as course_id,
  c.code,
  c.title,
  u.full_name as instructor_name,
  e.enrollment_date,
  e.status,
  (SELECT COUNT(*) FROM lectures WHERE course_id = c.id) as total_lectures,
  (SELECT COUNT(*) FROM attendance a
   JOIN lectures l ON a.lecture_id = l.id
   WHERE a.student_id = e.student_id AND l.course_id = c.id AND a.attended = true) as lectures_attended,
  calculate_attendance_percentage(e.student_id, c.id) as attendance_percentage,
  calculate_course_gpa(e.student_id, c.id) as course_gpa
FROM enrollments e
JOIN courses c ON e.course_id = c.id
JOIN users u ON c.instructor_id = u.id;

-- View: Instructor course overview
CREATE OR REPLACE VIEW v_instructor_course_overview AS
SELECT
  c.id,
  c.code,
  c.title,
  c.description,
  c.semester,
  c.start_date,
  c.end_date,
  (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'active') as active_students,
  (SELECT COUNT(*) FROM lectures WHERE course_id = c.id) as total_lectures,
  (SELECT COUNT(*) FROM assessments WHERE course_id = c.id) as total_assessments,
  (SELECT AVG(calculate_attendance_percentage(e.student_id, c.id))
   FROM enrollments e WHERE e.course_id = c.id AND e.status = 'active') as avg_attendance,
  (SELECT AVG(g.score)
   FROM grades g
   JOIN assessments a ON g.assessment_id = a.id
   WHERE a.course_id = c.id AND g.graded_at IS NOT NULL) as avg_score
FROM courses c;

-- View: Lecture attendance summary
CREATE OR REPLACE VIEW v_lecture_attendance_summary AS
SELECT
  l.id,
  l.title,
  l.course_id,
  l.scheduled_date,
  l.is_mandatory,
  (SELECT COUNT(*) FROM attendance WHERE lecture_id = l.id AND attended = true) as students_attended,
  (SELECT COUNT(*) FROM enrollments WHERE course_id = l.course_id AND status = 'active') as total_enrolled,
  ROUND(
    (SELECT COUNT(*) FROM attendance WHERE lecture_id = l.id AND attended = true)::DECIMAL /
    (SELECT COUNT(*) FROM enrollments WHERE course_id = l.course_id AND status = 'active')::DECIMAL * 100,
    2
  ) as attendance_rate
FROM lectures l;

-- View: Assessment submission status
CREATE OR REPLACE VIEW v_assessment_submission_status AS
SELECT
  a.id,
  a.title,
  a.type,
  a.course_id,
  a.due_date,
  (SELECT COUNT(*) FROM enrollments WHERE course_id = a.course_id AND status = 'active') as total_students,
  (SELECT COUNT(*) FROM grades WHERE assessment_id = a.id AND submitted_at IS NOT NULL) as submitted,
  (SELECT COUNT(*) FROM grades WHERE assessment_id = a.id AND graded_at IS NOT NULL) as graded,
  (SELECT AVG(score) FROM grades WHERE assessment_id = a.id AND graded_at IS NOT NULL) as avg_score
FROM assessments a;
