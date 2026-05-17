-- Enhanced Assignment Grading Tables
-- Adds comprehensive grading and feedback system

-- Assignment Grades/Feedback table
CREATE TABLE IF NOT EXISTS public.assignment_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL UNIQUE REFERENCES public.assignment_submissions(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  marks_obtained DECIMAL(10, 2),
  feedback TEXT,
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assignment_grades_submission ON public.assignment_grades(submission_id);
CREATE INDEX IF NOT EXISTS idx_assignment_grades_student ON public.assignment_grades(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_grades_assignment ON public.assignment_grades(assignment_id);

-- Update assignment_submissions to include status tracking
ALTER TABLE public.assignment_submissions ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'submitted';
ALTER TABLE public.assignment_submissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Status can be: submitted, graded, pending_review, returned_for_resubmission

-- RLS Policies for Assignment Grades
ALTER TABLE public.assignment_grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own grades"
ON public.assignment_grades
FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Instructors can view grades for their assignments"
ON public.assignment_grades
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.assignments
    WHERE id = assignment_grades.assignment_id
    AND created_by = auth.uid()
  )
);

CREATE POLICY "Instructors can create grades"
ON public.assignment_grades
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.assignments
    WHERE id = assignment_id
    AND created_by = auth.uid()
  )
);

CREATE POLICY "Instructors can update grades"
ON public.assignment_grades
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.assignments
    WHERE id = assignment_grades.assignment_id
    AND created_by = auth.uid()
  )
);

-- RLS for assignment_submissions (if not already set)
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Students can view their own submissions"
ON public.assignment_submissions
FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Students can submit assignments"
ON public.assignment_submissions
FOR INSERT
WITH CHECK (student_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Instructors can view submissions for their assignments"
ON public.assignment_submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.assignments
    WHERE id = assignment_submissions.assignment_id
    AND created_by = auth.uid()
  )
);

-- Create view for submission status summary
CREATE OR REPLACE VIEW public.v_assignment_submissions_status AS
SELECT
  a.id as assignment_id,
  a.title,
  a.due_date,
  a.marks_available,
  a.class_id,
  COUNT(DISTINCT sub.student_id) as total_submitted,
  COUNT(DISTINCT CASE WHEN ag.marks_obtained IS NOT NULL THEN sub.student_id END) as graded_count,
  COUNT(DISTINCT CASE WHEN sub.is_late THEN sub.student_id END) as late_submissions,
  AVG(ag.marks_obtained) as average_marks
FROM public.assignments a
LEFT JOIN public.assignment_submissions sub ON a.id = sub.assignment_id
LEFT JOIN public.assignment_grades ag ON sub.id = ag.submission_id
GROUP BY a.id, a.title, a.due_date, a.marks_available, a.class_id;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_assignment_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_assignment_submissions_updated_at_trigger ON public.assignment_submissions;
CREATE TRIGGER update_assignment_submissions_updated_at_trigger
BEFORE UPDATE ON public.assignment_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_assignment_submissions_updated_at();

CREATE OR REPLACE FUNCTION public.update_assignment_grades_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_assignment_grades_updated_at_trigger ON public.assignment_grades;
CREATE TRIGGER update_assignment_grades_updated_at_trigger
BEFORE UPDATE ON public.assignment_grades
FOR EACH ROW
EXECUTE FUNCTION public.update_assignment_grades_updated_at();
