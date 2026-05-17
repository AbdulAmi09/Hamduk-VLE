# Quiz/Assessment Engine - Documentation

## Overview

The Quiz/Assessment Engine is a comprehensive system for creating, managing, and grading quizzes within the Hamduk VLE platform. It supports multiple question types, automatic and manual grading, attempt history tracking, and detailed result analysis.

## Features

### 1. **Question Bank Management**
- Create and organize question banks by subject and difficulty level
- Support for multiple question types:
  - **Multiple Choice (MCQ)** - Select one correct answer from options
  - **True/False** - Binary choice questions
  - **Short Answer** - Student-provided text answers (manually graded)
  - **Essay** - Long-form answers (manually graded)
- Add explanations to questions for student learning
- Tag and categorize questions for easy retrieval
- Full CRUD operations on questions

**Access**: Instructors and above  
**Pages**: `/dashboard/questions`

### 2. **Quiz Creation & Management**
- Create quizzes from question banks
- Configure quiz settings:
  - **Duration**: Time limit in minutes
  - **Max Attempts**: Number of times students can retake
  - **Pass Percentage**: Minimum score to pass
  - **Show Results**: Whether students see their scores
  - **Show Answers**: Whether correct answers are revealed
- Publish quizzes to make them available to students
- Draft/Active/Closed status management
- Auto-calculation of total points based on questions

**Access**: Instructors and above  
**Pages**: `/dashboard/quizzes`, `/dashboard/quizzes/grade`

### 3. **Student Quiz Taking**
- Clean, intuitive quiz interface
- Real-time countdown timer with warnings
- Question navigation (previous/next)
- Answer validation before submission
- Support for all question types
- Auto-save of answers during quiz
- Prevents submission on timeout

**Access**: Students  
**Pages**: `/dashboard/quizzes`, `/dashboard/quizzes/[quizId]`

### 4. **Automatic Grading**
- Instant grading for MCQ and True/False questions
- Percentage-based scoring
- Comparison against correct answers
- Display of pass/fail status

**Grading Logic**:
```
score = (points_earned / total_points) * 100
passed = score >= pass_percentage
```

### 5. **Manual Grading Interface**
- Grade essays and short answers
- Mark points earned for each question
- Provide detailed feedback to students
- Review student answers side-by-side with grading form
- Batch grading workflow

**Access**: Instructors  
**Pages**: `/dashboard/quizzes/grade`

### 6. **Results & Feedback**
- Display final scores and pass/fail status
- Show explanations for correct answers (if enabled)
- Review of student's answers vs correct answers
- Detailed breakdown by question

### 7. **Attempt History**
- Track all student quiz attempts
- View attempt timeline
- Access previous results and feedback
- Time spent tracking
- Retake options (if attempts remaining)

**Access**: Students view own history, instructors view all attempts  
**Pages**: `/dashboard/quizzes/attempts`

## Database Schema

### Tables

#### `quizzes`
Main quiz configuration table.

```sql
- id: UUID (Primary Key)
- title: VARCHAR
- description: TEXT
- class_id: UUID (Foreign Key)
- created_by: UUID (Instructor ID)
- question_bank_id: UUID (Foreign Key)
- duration_minutes: INTEGER
- max_attempts: INTEGER
- pass_percentage: NUMERIC
- show_results: BOOLEAN
- show_answers: BOOLEAN
- total_questions: INTEGER
- total_points: INTEGER
- status: VARCHAR ('draft' | 'active' | 'closed')
- published_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `quiz_attempts`
Records of student quiz attempts.

```sql
- id: UUID (Primary Key)
- quiz_id: UUID (Foreign Key)
- student_id: UUID (Foreign Key)
- started_at: TIMESTAMP
- submitted_at: TIMESTAMP (NULL if not submitted)
- auto_graded_score: NUMERIC (percentage)
- score: NUMERIC (final score with manual grading)
- time_spent_minutes: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

UNIQUE(quiz_id, student_id) - Only one active attempt per student per quiz
```

#### `quiz_answers`
Student answers to each question.

```sql
- id: UUID (Primary Key)
- attempt_id: UUID (Foreign Key)
- question_id: UUID (Foreign Key)
- student_answer: JSONB (The answer provided by student)
- is_correct: BOOLEAN (For MCQ/True-False)
- points_earned: NUMERIC (Points awarded)
- created_at: TIMESTAMP
```

#### `quiz_grades`
Manual grades for essay/short answer questions.

```sql
- id: UUID (Primary Key)
- attempt_id: UUID (Foreign Key)
- question_id: UUID (Foreign Key)
- student_id: UUID (Foreign Key)
- marks_obtained: NUMERIC
- feedback: TEXT
- graded_by: UUID (Instructor ID)
- graded_at: TIMESTAMP
- created_at: TIMESTAMP

UNIQUE(attempt_id, question_id) - One grade per question per attempt
```

### Related Tables (Already Existing)

#### `question_banks`
```sql
- id: UUID (Primary Key)
- name: VARCHAR
- description: TEXT
- course_id: UUID
- instructor_id: UUID
- created_by: UUID
- total_questions: INTEGER
- difficulty_level: VARCHAR
- subject_area: VARCHAR
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `questions`
```sql
- id: UUID (Primary Key)
- question_bank_id: UUID (Foreign Key)
- question_text: TEXT
- question_type: VARCHAR ('mcq' | 'true_false' | 'short_answer' | 'essay')
- difficulty_level: VARCHAR
- points: INTEGER
- options: JSONB (For MCQ/True-False)
- correct_answer: JSONB
- explanation: TEXT
- tags: ARRAY
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## API Endpoints

### Grading API

**POST** `/api/quizzes/grade`
Grade essays/short answers.

Request:
```json
{
  "gradeId": "uuid",
  "attemptId": "uuid",
  "questionId": "uuid",
  "marksObtained": 8.5,
  "feedback": "Great answer with good examples"
}
```

Response:
```json
{
  "id": "uuid",
  "attempt_id": "uuid",
  "question_id": "uuid",
  "marks_obtained": 8.5,
  "feedback": "Great answer with good examples",
  "graded_by": "uuid",
  "graded_at": "2024-05-17T10:30:00Z"
}
```

**GET** `/api/quizzes/grade?attemptId=uuid`
Fetch grades for a quiz attempt.

Response:
```json
[
  {
    "id": "uuid",
    "attempt_id": "uuid",
    "question_id": "uuid",
    "marks_obtained": 8.5,
    "feedback": "Good work"
  }
]
```

## User Flows

### Instructor: Create & Manage Quiz

1. Navigate to `/dashboard/questions` to create/manage question banks
2. Add questions of various types with correct answers and explanations
3. Go to `/dashboard/quizzes` to create a new quiz
4. Select class and question bank
5. Configure settings (time, attempts, pass percentage)
6. Publish the quiz to make it available to students
7. Monitor student attempts in real-time
8. Grade essays/short answers in `/dashboard/quizzes/grade`

### Student: Take Quiz

1. Navigate to `/dashboard/quizzes` to see available quizzes
2. Click on a quiz to start
3. Review quiz details and instructions
4. Click "Start Quiz" to begin
5. Answer questions (timer counts down)
6. Navigate between questions
7. Submit quiz when done
8. View results and explanations (if enabled)
9. Check history in `/dashboard/quizzes/attempts`
10. Retake if attempts remaining

## Security & RLS

### Row-Level Security Policies

**Quizzes**
- Instructors can create quizzes
- Instructors can view/manage their own quizzes
- Students can view active quizzes from their classes
- Only quiz creator can publish/delete

**Quiz Attempts**
- Students can only view their own attempts
- Instructors can view all attempts for their quizzes
- Students can create and update own attempts

**Quiz Answers**
- Students can only view their own answers
- Instructors can view answers for their quizzes
- Students can insert answers for their attempts

**Quiz Grades**
- Students can only view their own grades
- Instructors can grade and view grades for their quizzes

## Implementation Details

### Auto-Grading Logic
```typescript
// Only for MCQ and True/False
if (studentAnswer === correctAnswer) {
  pointsEarned = questionPoints
} else {
  pointsEarned = 0
}

autoGradedScore = (totalPointsEarned / totalPoints) * 100
passed = autoGradedScore >= passingPercentage
```

### Timer Management
- Stored client-side with periodic sync
- Auto-submission on timeout
- Visual warnings when time < 5 minutes
- Resume capability if page refreshes

### Question Randomization (Future)
- Can shuffle question order per attempt
- Can shuffle MCQ options per attempt
- Currently disabled (linear order)

## Limitations & Future Enhancements

### Current Limitations
1. Questions presented in bank order (not shuffled)
2. No partial credit for MCQ
3. No question categories within quiz
4. No review mode (before submission)
5. No image/video in questions (text only)

### Future Enhancements
1. **Question Randomization** - Shuffle questions and options
2. **Question Categories** - Group questions by topic within quiz
3. **Timed Questions** - Different time limits per question
4. **Partial Credit** - Award partial points for MCQ
5. **Rich Media** - Support images, videos, code blocks
6. **Peer Review** - Students review each other's answers
7. **Analytics Dashboard** - Detailed performance analytics
8. **Question Bank Analytics** - Question difficulty/discrimination
9. **Rubric-Based Grading** - Define grading criteria
10. **AI-Powered Grading** - Auto-grade essays with AI

## Testing Checklist

- [ ] Create question bank with mixed question types
- [ ] Create quiz from question bank
- [ ] Publish quiz to active status
- [ ] Take quiz as student (all question types)
- [ ] Submit before timeout
- [ ] View auto-graded results
- [ ] Review student attempt as instructor
- [ ] Grade essay/short answer questions
- [ ] View updated score with manual grades
- [ ] Check attempt history as student
- [ ] Verify RLS policies (cross-user access prevented)
- [ ] Test timer countdown and auto-submission
- [ ] Test max attempts enforcement
- [ ] Test pass percentage calculation

## File Structure

```
app/
├── api/
│   └── quizzes/
│       └── grade/
│           └── route.ts
├── dashboard/
│   ├── questions/
│   │   └── page.tsx          # Question bank management
│   ├── quizzes/
│   │   ├── page.tsx          # Quiz list and creation
│   │   ├── [quizId]/
│   │   │   └── page.tsx      # Quiz taking interface
│   │   ├── attempts/
│   │   │   └── page.tsx      # Student attempt history
│   │   └── grade/
│   │       └── page.tsx      # Manual grading interface
scripts/
└── 006-quiz-engine.sql       # Database schema migration
```

## Configuration

All quiz configuration is handled via the quiz creation dialog. No environment variables required beyond base Supabase setup.

## Troubleshooting

### Quiz not appearing for students
- Verify quiz status is "active"
- Check students are enrolled in the class
- Verify class_id is set correctly

### Answers not saving
- Check browser console for errors
- Verify student has INSERT permission on quiz_answers
- Check network tab for failed API requests

### Grading not working
- Verify instructor created the quiz
- Check RLS policies allow instructor access
- Verify question has correct answer data

## Support

For issues or feature requests, contact: support@hamduk.edu
