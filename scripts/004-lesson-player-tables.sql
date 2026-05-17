-- Create lesson_notes table for timestamped notes during video playback
CREATE TABLE IF NOT EXISTS public.lesson_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    timestamp_seconds INTEGER NOT NULL DEFAULT 0,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(lesson_id, student_id, timestamp_seconds, created_at)
);

-- Enable RLS
ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lesson_notes
CREATE POLICY "Students can view their own notes"
    ON public.lesson_notes FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY "Students can create notes for lessons they're enrolled in"
    ON public.lesson_notes FOR INSERT
    WITH CHECK (
        auth.uid() = student_id AND
        EXISTS (
            SELECT 1 FROM public.lesson_progress lp
            WHERE lp.lesson_id = lesson_notes.lesson_id
            AND lp.student_id = auth.uid()
        )
    );

CREATE POLICY "Students can update their own notes"
    ON public.lesson_notes FOR UPDATE
    USING (auth.uid() = student_id);

CREATE POLICY "Students can delete their own notes"
    ON public.lesson_notes FOR DELETE
    USING (auth.uid() = student_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lesson_notes_lesson_id ON public.lesson_notes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_student_id ON public.lesson_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_timestamp ON public.lesson_notes(timestamp_seconds);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_lesson_student ON public.lesson_notes(lesson_id, student_id);

-- Update attendance table to support lesson player
ALTER TABLE public.attendance
ADD COLUMN IF NOT EXISTS attended BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS marked_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for attendance queries
CREATE INDEX IF NOT EXISTS idx_attendance_lecture_student ON public.attendance(lecture_id, student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_marked_at ON public.attendance(marked_at);

-- Create trigger to update lesson_notes updated_at
CREATE OR REPLACE FUNCTION update_lesson_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_lesson_notes_updated_at ON public.lesson_notes;
CREATE TRIGGER trigger_lesson_notes_updated_at
    BEFORE UPDATE ON public.lesson_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_lesson_notes_updated_at();
