-- Quiz Engine Tables for Hamduk VLE

-- Quiz Table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_bank_id UUID REFERENCES question_banks(id) ON DELETE SET NULL,
  duration_minutes INTEGER DEFAULT 60,
  max_attempts INTEGER DEFAULT 1,
  pass_percentage NUMERIC DEFAULT 60,
  show_results BOOLEAN DEFAULT TRUE,
  show_answers BOOLEAN DEFAULT FALSE,
  total_questions INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  status VARCHAR DEFAULT 'draft', -- draft, active, closed
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Quiz Attempts Table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  auto_graded_score NUMERIC, -- percentage
  score NUMERIC, -- final score with manual grading
  time_spent_minutes INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(quiz_id, student_id) -- Only allow one active attempt per student per quiz
);

-- Quiz Answers Table
CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  student_answer JSONB,
  is_correct BOOLEAN,
  points_earned NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz Grades Table (for manual grading of essays/short answers)
CREATE TABLE IF NOT EXISTS quiz_grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id),
  student_id UUID REFERENCES auth.users(id),
  marks_obtained NUMERIC,
  feedback TEXT,
  graded_by UUID REFERENCES auth.users(id),
  graded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(attempt_id, question_id)
);

-- RLS Policies

-- Quizzes
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can create quizzes"
  ON quizzes FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Instructors can view and manage own quizzes"
  ON quizzes FOR SELECT
  USING (auth.uid() = created_by OR status = 'active');

CREATE POLICY "Instructors can update own quizzes"
  ON quizzes FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Instructors can delete own quizzes"
  ON quizzes FOR DELETE
  USING (auth.uid() = created_by);

-- Quiz Attempts
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own attempts"
  ON quiz_attempts FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Instructors can view attempts for their quizzes"
  ON quiz_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      WHERE q.id = quiz_attempts.quiz_id
      AND q.created_by = auth.uid()
    )
  );

CREATE POLICY "Students can insert attempts"
  ON quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own attempts"
  ON quiz_attempts FOR UPDATE
  USING (auth.uid() = student_id);

-- Quiz Answers
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own answers"
  ON quiz_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts qa
      WHERE qa.id = quiz_answers.attempt_id
      AND qa.student_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can view answers for their quizzes"
  ON quiz_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts qa
      JOIN quizzes q ON q.id = qa.quiz_id
      WHERE qa.id = quiz_answers.attempt_id
      AND q.created_by = auth.uid()
    )
  );

CREATE POLICY "Students can insert answers"
  ON quiz_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quiz_attempts qa
      WHERE qa.id = quiz_answers.attempt_id
      AND qa.student_id = auth.uid()
    )
  );

-- Quiz Grades
ALTER TABLE quiz_grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own grades"
  ON quiz_grades FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Instructors can grade their quizzes"
  ON quiz_grades FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quiz_attempts qa
      JOIN quizzes q ON q.id = qa.quiz_id
      WHERE qa.id = quiz_grades.attempt_id
      AND q.created_by = auth.uid()
    )
  );

CREATE POLICY "Instructors can view grades for their quizzes"
  ON quiz_grades FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts qa
      JOIN quizzes q ON q.id = qa.quiz_id
      WHERE qa.id = quiz_grades.attempt_id
      AND q.created_by = auth.uid()
    )
  );

CREATE POLICY "Instructors can update grades"
  ON quiz_grades FOR UPDATE
  USING (auth.uid() = graded_by);

-- Indexes for Performance
CREATE INDEX idx_quizzes_class_id ON quizzes(class_id);
CREATE INDEX idx_quizzes_created_by ON quizzes(created_by);
CREATE INDEX idx_quizzes_status ON quizzes(status);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_student_id ON quiz_attempts(student_id);
CREATE INDEX idx_quiz_attempts_submitted ON quiz_attempts(submitted_at);
CREATE INDEX idx_quiz_answers_attempt_id ON quiz_answers(attempt_id);
CREATE INDEX idx_quiz_answers_question_id ON quiz_answers(question_id);
CREATE INDEX idx_quiz_grades_attempt_id ON quiz_grades(attempt_id);
CREATE INDEX idx_quiz_grades_student_id ON quiz_grades(student_id);

-- Triggers for updated_at
CREATE TRIGGER update_quizzes_timestamp
  BEFORE UPDATE ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_quiz_attempts_timestamp
  BEFORE UPDATE ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_quiz_grades_timestamp
  BEFORE UPDATE ON quiz_grades
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();
