# Hamduk VLE - Complete Application Documentation

## Overview
Hamduk VLE (Virtual Learning Environment) is an enterprise-grade learning management system built for hybrid education. It combines traditional LMS features with AI-powered tutoring, secure payments, real-time collaboration, and comprehensive analytics. The platform is designed to scale to 10,000+ concurrent users with production-ready security and performance.

---

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Core Architecture](#core-architecture)
3. [Features & Functionality](#features--functionality)
4. [Database Schema](#database-schema)
5. [API Routes & Endpoints](#api-routes--endpoints)
6. [Component Structure](#component-structure)
7. [Authentication & Security](#authentication--security)
8. [Integrations](#integrations)
9. [Real-Time & WebSocket](#real-time--websocket)
10. [Deployment & Environment](#deployment--environment)
11. [File Structure](#file-structure)

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15.2.8 (React 19)
- **Styling**: Tailwind CSS 4.1.9
- **Component Library**: shadcn/ui (60+ pre-built components)
- **UI Components Used**:
  - Buttons, Cards, Inputs, Labels, Textareas
  - Tabs, Accordion, Alert Dialog
  - Dropdown Menu, Context Menu, Popover
  - Select, Checkbox, Radio Group, Toggle
  - Progress, Slider, Switch
  - Scroll Area, Separator, Toast, Tooltip
  - And 40+ more specialized components
- **Form Management**: React Hook Form + Zod validation
- **Data Fetching**: SWR (can be integrated)
- **Theme Management**: next-themes (dark/light/system)
- **Icons**: Lucide React (400+ icons)
- **Charts**: Recharts (data visualization)
- **Notifications**: Sonner (toast notifications)
- **Date Handling**: date-fns

### Backend
- **API**: Next.js API Routes (serverless functions)
- **Server Components**: React Server Components for optimal rendering
- **Database Client**: Supabase (@supabase/ssr, @supabase/supabase-js)
- **AI Integration**: Vercel AI SDK with OpenAI
- **Session Management**: JWT tokens via Supabase Auth

### Database
- **Primary DB**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT-based)
- **Security**: Row-Level Security (RLS) policies
- **Real-Time**: Supabase Realtime (WebSocket)

### External Services
- **Payments**: Paystack API (Africa's leading payment processor)
- **AI**: OpenAI GPT-4 (via Vercel AI SDK)
- **Email**: Resend (optional, for notifications)
- **Analytics**: Built-in database analytics
- **Deployment**: Vercel (serverless hosting)

### Development Tools
- **Language**: TypeScript 5
- **Package Manager**: pnpm
- **Code Quality**: ESLint (linting)
- **Build Tool**: Next.js build system
- **Node Version**: 18+ (Vercel default)

---

## Core Architecture

### Application Layers

```
┌─────────────────────────────────────────┐
│       Client (Browser/Mobile)            │
│     React 19 + Next.js Pages             │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    Next.js App Router (SSR/SSG/ISR)      │
│  - Server Components                     │
│  - API Routes                            │
│  - Middleware                            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│     Authentication Layer                 │
│  - Supabase Auth (JWT)                   │
│  - Session Management                    │
│  - Role-Based Access Control             │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│     Business Logic Layer                 │
│  - Course Management                     │
│  - Enrollment System                     │
│  - Grading & Assessment                  │
│  - Payment Processing                    │
│  - AI Integration                        │
│  - Real-Time Updates                     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│     Data Access Layer                    │
│  - Supabase Client (Browser)             │
│  - Supabase Server (Server)              │
│  - Row-Level Security (RLS)              │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│     Data Layer                           │
│  - PostgreSQL (via Supabase)             │
│  - Database Functions & Triggers         │
│  - Real-Time Subscriptions               │
│  - Full-Text Search                      │
└─────────────────────────────────────────┘
```

---

## Features & Functionality

### 1. Learning Management System (LMS)

#### Course Management
- **Create Courses**: Instructors can create courses with title, description, code
- **Course Fields**: 
  - Course code (unique identifier)
  - Title & description
  - Instructor assignment
  - Institution association
  - Semester/term tracking
  - Start & end dates
  - Course pricing (for monetization)
- **Course Status**: Active, Draft, Archived
- **Enrollment Tracking**: Monitor student enrollments per course

#### Video Lectures
- **Video Hosting**: Stream videos via video_url field
- **Duration Tracking**: Store lecture duration in minutes
- **Scheduling**: Set scheduled_date for synchronous lectures
- **Mandatory Lectures**: Flag lectures as mandatory
- **Watch Tracking**: Track watch duration and percentage
- **Attendance**: Auto-mark attendance at 75% watch completion
- **Lecture State**: Track watched/unwatched status
- **Playback Controls**: Video player with:
  - Play/pause controls
  - Progress bar
  - Volume control
  - Fullscreen mode
  - Playback speed adjustment

#### Assessments & Grading
- **Assessment Types**: Quiz, Assignment, Exam, Project
- **Question Types**:
  - Multiple choice questions
  - True/False questions
  - Short answer questions
  - Essay questions
- **Due Dates**: Set deadlines for submissions
- **Scoring**: Configure total points per assessment
- **Auto-Grading**: Automated grading for objective questions
- **Manual Grading**: Instructor grading with feedback
- **Grade Tracking**: Store scores and feedback per student
- **Grade Calculation**: Auto-calculate course GPA
- **Transcripts**: Student can view all grades

#### Progress Tracking
- **Completion Status**: Track lecture completion per student
- **Progress Percentage**: Overall course progress calculation
- **Time Spent**: Monitor learning time
- **Milestone Tracking**: Mark milestones achieved
- **Visual Progress**: Progress bars and indicators
- **Performance Metrics**: Assessment performance tracking
- **Recommendations**: AI-powered learning recommendations

### 2. Student Enrollment

#### Enrollment Methods
1. **Manual Enrollment**: Instructor adds students directly
   - Instructor selects student from list
   - System creates enrollment record
   - Student gets notification

2. **Bulk Enrollment**: Upload CSV file with student emails
   - Import multiple students at once
   - Map email fields
   - Batch create enrollments
   - Send bulk notifications

3. **Self-Enrollment with Code**: Students use enrollment code
   - Student enters unique code
   - System validates code
   - Auto-creates enrollment
   - Instant course access

4. **Payment-Based Enrollment**: Auto-enroll after payment
   - Student purchases course
   - Payment verified with Paystack
   - Automatic enrollment
   - Instant access to course content

#### Enrollment Status
- **Active**: Student is actively enrolled
- **Dropped**: Student withdrew from course
- **Completed**: Student finished course
- **Payment Pending**: Awaiting payment verification
- **Suspended**: Enrollment suspended (admin only)

### 3. User Management & Profiles

#### User Roles
1. **Student Role**:
   - Enroll in courses
   - Submit assessments
   - View grades
   - Access AI tutor
   - View progress
   - Join discussions

2. **Instructor Role**:
   - Create and manage courses
   - Add/remove students
   - Create assessments
   - Grade submissions
   - View class analytics
   - Set course pricing
   - Manage enrollment codes

3. **Admin Role**:
   - Approve courses
   - Manage users
   - Moderate content
   - View platform analytics
   - Access revenue reports
   - System configuration

#### User Profiles
- **Fields**:
  - Email (unique)
  - Full name
  - Role (student/instructor/admin)
  - Institution affiliation
  - Avatar/profile picture
  - Bio/description
  - Contact information
  - Gamification data (XP, badges)
- **Profile Features**:
  - Edit own profile
  - View public profiles
  - Privacy settings
  - Activity history
  - Course history

### 4. AI-Powered Learning (GPT-4)

#### AI Tutor Chat
- **Functionality**: Real-time Q&A about course content
- **Features**:
  - Streaming responses (word-by-word)
  - Context-aware answers
  - Course-specific knowledge
  - Multi-turn conversations
  - Session history
  - Export conversations
- **API Endpoint**: `POST /api/ai/tutor`
- **Response Format**: Streamed text with metadata

#### Concept Explanation
- **Purpose**: Simplify complex topics
- **Features**:
  - Real-world analogies
  - Step-by-step breakdowns
  - Multiple explanation levels
  - Visual diagram suggestions
  - Examples and use cases
- **API Endpoint**: `POST /api/ai/explain`

#### Content Summarization
- **Supported Formats**: Videos, PDFs, Articles, Text
- **Features**:
  - Extractive summarization
  - Key point identification
  - Bullet-point summaries
  - Different summary lengths
  - Multi-language support
- **API Endpoint**: `POST /api/ai/summarize`

#### Quiz Generation
- **Features**:
  - Auto-generate questions from content
  - Multiple difficulty levels (easy/medium/hard)
  - Configurable question count
  - Mixed question types
  - Answer key generation
  - Difficulty balancing
- **API Endpoint**: `POST /api/ai/quiz`

#### Knowledge Gap Detection
- **Purpose**: Identify weak areas
- **Features**:
  - Analyze assessment performance
  - Identify struggling topics
  - Generate revision plans
  - Suggest practice areas
  - Track improvement over time
- **API Endpoint**: `POST /api/ai/gaps`

### 5. Payment & Monetization (Paystack)

#### Paystack Integration
- **Payment Processor**: Paystack (Africa's leading platform)
- **Supported Countries**: Nigeria, Ghana, Kenya, Uganda, South Africa, etc.
- **Currencies**: NGN (Nigerian Naira), USD, GHS, KES, ZAR
- **Supported Payment Methods**: Cards, Bank Transfers, Mobile Money, USSD

#### Course Pricing
- **Free Courses**: Set is_free = true
- **Paid Courses**: Set price and is_free = false
- **Flexible Pricing**: Change prices anytime
- **Price Display**: Show on course cards and details

#### Payment Flow
1. **Initialization**:
   - Student clicks "Enroll" on paid course
   - Frontend calls `POST /api/payments/initialize`
   - Backend creates Paystack transaction
   - Returns authorization_url
   - Redirect to Paystack payment page

2. **Payment**:
   - Student enters payment details
   - Paystack processes payment
   - Returns payment reference

3. **Verification**:
   - Frontend calls `POST /api/payments/verify`
   - Backend verifies with Paystack
   - Checks payment status
   - Updates payments table

4. **Enrollment**:
   - If payment successful
   - Auto-create enrollment
   - Grant course access
   - Send confirmation email
   - Update student dashboard

5. **Webhook**:
   - Paystack sends webhook event
   - Backend receives at `POST /api/payments/webhook`
   - Verify webhook signature
   - Update payment status
   - Handle failed payments

#### Payment Data
- **payments Table**:
  - id (UUID)
  - user_id (student)
  - course_id
  - amount (decimal)
  - currency (default NGN)
  - status (pending/completed/failed)
  - reference (Paystack reference)
  - access_code (Paystack code)
  - metadata (JSON: course info, student info)
  - created_at, updated_at

#### Payment Status Tracking
- View transaction history
- Download invoices
- Refund requests
- Payment receipts
- Tax reporting

### 6. Real-Time Features

#### WebSocket Support
- **Technology**: Supabase Realtime
- **Connection**: Automatic on app load
- **Events**:
  - Course updates
  - New grades posted
  - Student enrollment
  - Comment notifications
  - Assignment submissions

#### Real-Time Attendance
- **Live Tracking**: Track students watching lectures in real-time
- **Watch Percentage**: Update live as students watch
- **Instant Marking**: Auto-mark attendance when threshold reached
- **Teacher View**: Instructor sees real-time attendance list

#### Real-Time Notifications
- **Grade Posted**: Instant notification when grade released
- **New Message**: Notification for new messages/comments
- **Assignment Due**: Reminder when assignment due soon
- **Course Announcement**: New course announcements
- **System Alerts**: Platform maintenance notices

#### Real-Time Progress
- **Dashboard Updates**: Progress bars update without refresh
- **Leaderboards**: Live ranking updates
- **Performance Metrics**: Real-time stats
- **Activity Feed**: Live activity stream

### 7. Authentication & Authorization

#### Sign-Up Process
1. **Registration Page**: Student/Instructor enters details
   - Email (must be unique)
   - Password (minimum 8 characters)
   - Full name
   - Role selection
   - Institution (optional)
2. **Email Verification**: Confirmation email sent
3. **Profile Creation**: Auto-create user profile
4. **Dashboard Access**: Redirect to appropriate dashboard

#### Sign-In Process
1. **Login Page**: Enter email and password
2. **JWT Token**: Supabase Auth returns JWT token
3. **Session Management**: Token stored securely
4. **Auto-Refresh**: Token refreshes before expiry
5. **Role Check**: Load appropriate dashboard

#### Password Recovery
1. **Forgot Password Page**: Enter email
2. **Reset Link**: Email with reset link sent
3. **Reset Page**: Set new password
4. **Confirmation**: Password updated successfully
5. **Re-login**: User logs in with new password

#### Role-Based Access Control
- **Middleware**: Check role before allowing access
- **Page Protection**: 
  - `/dashboard` - All authenticated users
  - `/instructor` - Instructors only
  - `/admin` - Admins only
- **API Protection**: Role check on route handlers
- **Component Level**: Conditionally render based on role

### 8. Theme & Customization

#### Light/Dark Mode
- **Theme Toggle**: Button in header to switch themes
- **System Preference**: Auto-detect system preference
- **Persistence**: Save user preference in localStorage
- **Smooth Transition**: CSS transitions for theme change
- **Full Coverage**: All pages and components support themes

#### Color System
- **Light Mode**: 
  - Background: White (#FFFFFF)
  - Text: Black (#000000)
  - Accent: Blue (#3B82F6)
  - Neutral: Gray shades
  
- **Dark Mode**:
  - Background: Dark gray (#1F2937)
  - Text: Light gray (#F3F4F6)
  - Accent: Blue (#60A5FA)
  - Neutral: Inverted gray shades

#### Responsive Design
- **Mobile First**: Design for mobile first
- **Breakpoints**:
  - Mobile: 0-640px
  - Tablet: 640-1024px
  - Desktop: 1024px+
- **Layout**: Sidebar collapses on mobile
- **Touch**: Large touch targets for mobile

---

## Database Schema

### Core Tables

#### users (Supabase Auth Users)
```sql
-- Via Supabase Auth, stores authentication data
-- Columns: id, email, password_hash, created_at, updated_at
-- No need to manually create - Supabase handles it
```

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) CHECK (role IN ('student', 'instructor', 'admin')),
  institution_id UUID REFERENCES institutions(id),
  avatar_url VARCHAR(500),
  bio TEXT,
  xp INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### institutions
```sql
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  country VARCHAR(100),
  website VARCHAR(500),
  logo_url VARCHAR(500),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### courses
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor_id UUID NOT NULL REFERENCES profiles(id),
  institution_id UUID REFERENCES institutions(id),
  price DECIMAL(10, 2) DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  payment_required BOOLEAN DEFAULT false,
  semester VARCHAR(50),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX idx_courses_code ON courses(code);
```

#### lectures
```sql
CREATE TABLE lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url VARCHAR(500),
  duration_minutes INT,
  scheduled_date TIMESTAMP,
  is_mandatory BOOLEAN DEFAULT false,
  display_order INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_lectures_course_id ON lectures(course_id);
```

#### enrollments
```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'dropped', 'completed', 'suspended')),
  payment_status VARCHAR(20) DEFAULT 'not_required',
  payment_id UUID REFERENCES payments(id),
  last_accessed TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id)
);

-- Indexes
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
```

#### attendance
```sql
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id UUID NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  watched_duration_minutes INT DEFAULT 0,
  total_duration_minutes INT,
  watch_percentage DECIMAL(5,2) DEFAULT 0,
  attendance_marked BOOLEAN DEFAULT false,
  marked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(lecture_id, student_id)
);

-- Indexes
CREATE INDEX idx_attendance_lecture_id ON attendance(lecture_id);
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
```

#### assessments
```sql
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) CHECK (type IN ('quiz', 'assignment', 'exam', 'project')),
  due_date TIMESTAMP,
  total_points INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_assessments_course_id ON assessments(course_id);
```

#### assessment_questions
```sql
CREATE TABLE assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay')),
  options JSONB, -- For multiple choice: {"A": "option1", "B": "option2", ...}
  correct_answer VARCHAR(255), -- For objective questions
  points INT DEFAULT 1,
  display_order INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_assessment_questions_assessment_id ON assessment_questions(assessment_id);
```

#### submissions
```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  submission_data JSONB, -- Store answers: {"q1": "answer1", "q2": "answer2", ...}
  submitted_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'graded', 'returned')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(assessment_id, student_id)
);

-- Indexes
CREATE INDEX idx_submissions_assessment_id ON submissions(assessment_id);
CREATE INDEX idx_submissions_student_id ON submissions(student_id);
```

#### grades
```sql
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score DECIMAL(5,2),
  percentage DECIMAL(5,2),
  feedback TEXT,
  submitted_at TIMESTAMP,
  graded_at TIMESTAMP,
  graded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(assessment_id, student_id)
);

-- Indexes
CREATE INDEX idx_grades_student_id ON grades(student_id);
CREATE INDEX idx_grades_assessment_id ON grades(assessment_id);
```

#### payments
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  reference VARCHAR(255) UNIQUE,
  access_code VARCHAR(255),
  authorization_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_course_id ON payments(course_id);
CREATE INDEX idx_payments_reference ON payments(reference);
```

#### subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  started_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
```

#### notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  related_id UUID,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```

#### notification_preferences
```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  email_grades BOOLEAN DEFAULT true,
  email_announcements BOOLEAN DEFAULT true,
  email_deadlines BOOLEAN DEFAULT true,
  email_messages BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Database Functions

#### calculate_gpa()
```sql
-- Auto-calculate GPA when grades are updated
-- Triggered on grades table INSERT/UPDATE
-- Updates user profile with calculated GPA
```

#### update_progress()
```sql
-- Auto-update course progress percentage
-- Calculate based on:
--   - Lecture completion (25%)
--   - Assessment completion (50%)
--   - Attendance (25%)
-- Updates enrollments table
```

#### check_attendance()
```sql
-- Trigger on attendance table UPDATE
-- If watch_percentage >= 75%
--   - Set attendance_marked = true
--   - Set marked_at = NOW()
-- Auto-marks attendance
```

#### sync_profile_with_auth()
```sql
-- Trigger on auth.users INSERT
-- Auto-creates profile record
-- Sets email from auth user
-- Sets role to 'student' by default
```

### Row-Level Security (RLS) Policies

#### profiles Table
```
- Users can view their own profile
- Users can update their own profile
- Admins can view/update all profiles
- Instructors can view students in their courses
```

#### courses Table
```
- All authenticated users can view published courses
- Instructors can create courses
- Instructors can update their own courses
- Admins can update/delete any course
```

#### enrollments Table
```
- Students can view their own enrollments
- Instructors can view enrollments in their courses
- Admins can view all enrollments
- System creates enrollment on payment success
```

#### assessments Table
```
- Students can view assessments for courses they're enrolled in
- Instructors can create/edit in their courses
- Admins can manage all assessments
```

#### grades Table
```
- Students can view their own grades
- Instructors can view/create grades for their courses
- Admins can view all grades
```

---

## API Routes & Endpoints

### Authentication API

#### `POST /api/auth` (Login/Signup)
**Request:**
```json
{
  "action": "signup" | "login",
  "email": "user@example.com",
  "password": "secure_password",
  "fullName": "John Doe",
  "role": "student" | "instructor"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "student"
  },
  "session": {
    "access_token": "jwt_token",
    "expires_in": 3600
  }
}
```

### Course Management API

#### `GET /api/courses` - List all courses
**Query Parameters:**
- `role`: "student" | "instructor" | "admin"
- `search`: search term
- `limit`: records per page (default 20)
- `offset`: pagination offset

**Response:**
```json
{
  "courses": [
    {
      "id": "uuid",
      "code": "CS101",
      "title": "Introduction to Computer Science",
      "description": "...",
      "instructor_id": "uuid",
      "price": 9999.00,
      "is_free": false,
      "enrollment_count": 45
    }
  ],
  "total": 150,
  "page": 1
}
```

#### `POST /api/courses` - Create course
**Request (Instructor only):**
```json
{
  "code": "CS101",
  "title": "Introduction to Computer Science",
  "description": "Learn the basics...",
  "semester": "2024-1",
  "price": 9999.00,
  "is_free": false
}
```

#### `GET /api/courses/[courseId]` - Get course details
**Response:** Detailed course object with student count, lecture count, assessment count

### Lectures API

#### `GET /api/lectures?courseId=[courseId]` - List lectures
**Response:**
```json
{
  "lectures": [
    {
      "id": "uuid",
      "course_id": "uuid",
      "title": "Lecture 1: Introduction",
      "duration_minutes": 45,
      "is_mandatory": true,
      "watched": false,
      "watch_percentage": 0
    }
  ]
}
```

#### `POST /api/lectures` - Create lecture
**Request:**
```json
{
  "course_id": "uuid",
  "title": "Lecture 1",
  "description": "...",
  "video_url": "https://...",
  "duration_minutes": 45,
  "is_mandatory": true,
  "scheduled_date": "2024-01-15T10:00:00Z"
}
```

#### `GET /api/lectures/[lectureId]` - Get lecture with video player details

### Attendance API

#### `POST /api/attendance` - Mark attendance
**Request:**
```json
{
  "lecture_id": "uuid",
  "student_id": "uuid",
  "watch_percentage": 75,
  "watched_duration_minutes": 34
}
```

**Response:**
```json
{
  "success": true,
  "attendance_marked": true,
  "message": "Attendance marked successfully"
}
```

#### `GET /api/attendance?courseId=[courseId]` - Get attendance report (Instructor)
**Response:**
```json
{
  "attendance_data": [
    {
      "student_name": "John Doe",
      "lecture_title": "Lecture 1",
      "attendance": true,
      "percentage": 92
    }
  ]
}
```

### Assessments API

#### `POST /api/assessments` - Create assessment
**Request:**
```json
{
  "course_id": "uuid",
  "title": "Quiz 1",
  "type": "quiz",
  "due_date": "2024-01-20T23:59:00Z",
  "total_points": 100,
  "questions": [
    {
      "text": "What is 2+2?",
      "type": "multiple_choice",
      "options": {"A": "3", "B": "4", "C": "5"},
      "correct_answer": "B",
      "points": 10
    }
  ]
}
```

#### `GET /api/assessments?courseId=[courseId]` - List assessments

#### `POST /api/assessments/[assessmentId]/submit` - Submit assessment
**Request:**
```json
{
  "answers": {
    "q1": "B",
    "q2": "correct",
    "q3": "This is my essay answer..."
  }
}
```

### Grades API

#### `POST /api/grades` - Create/Update grade
**Request:**
```json
{
  "assessment_id": "uuid",
  "student_id": "uuid",
  "score": 85,
  "feedback": "Good work!",
  "graded_by": "instructor_id"
}
```

#### `GET /api/grades?courseId=[courseId]` - Get all grades (Instructor)

#### `GET /api/grades?studentId=[studentId]` - Get student grades

### Enrollment API

#### `POST /api/enrollment` - Enroll student
**Request:**
```json
{
  "action": "manual" | "bulk" | "code" | "payment",
  "course_id": "uuid",
  "students": ["email1", "email2"], // for bulk
  "code": "ABC123", // for self-enrollment
  "payment_id": "uuid" // for payment
}
```

**Response:**
```json
{
  "success": true,
  "enrollments_created": 1,
  "failed": 0
}
```

#### `GET /api/enrollment?courseId=[courseId]` - List enrollments (Instructor)

### Payments API

#### `POST /api/payments/initialize` - Start payment
**Request:**
```json
{
  "course_id": "uuid",
  "email": "student@example.com",
  "amount": 9999,
  "currency": "NGN"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "authorization_url": "https://checkout.paystack.com/xxx",
    "access_code": "xxx",
    "reference": "ref_xxx",
    "amount": 9999
  }
}
```

#### `POST /api/payments/verify` - Verify payment
**Request:**
```json
{
  "reference": "ref_xxx"
}
```

**Response:**
```json
{
  "status": "success",
  "paid": true,
  "amount": 9999,
  "paidAt": "2024-01-15T10:00:00Z",
  "customer": { "email": "student@example.com" },
  "enrollment_created": true
}
```

#### `POST /api/payments/webhook` - Paystack webhook
**Triggered by**: Paystack payment events
**Actions**:
- Update payment status
- Create enrollment if payment successful
- Send confirmation email
- Update revenue records

### AI Features API

#### `POST /api/ai/tutor` - AI tutor chat
**Request:**
```json
{
  "message": "What is photosynthesis?",
  "course_id": "uuid",
  "conversation_history": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ]
}
```

**Response (Streaming):**
```
data: "Photosynthesis is"
data: " the process by which"
data: " plants convert light"
...
```

#### `POST /api/ai/explain` - Explain concept
**Request:**
```json
{
  "topic": "Quantum mechanics",
  "course_id": "uuid",
  "level": "beginner" | "intermediate" | "advanced"
}
```

#### `POST /api/ai/summarize` - Summarize content
**Request:**
```json
{
  "content": "...",
  "type": "video" | "pdf" | "article",
  "length": "short" | "medium" | "long"
}
```

#### `POST /api/ai/quiz` - Generate quiz
**Request:**
```json
{
  "content": "lecture content",
  "question_count": 5,
  "difficulty": "easy" | "medium" | "hard"
}
```

#### `POST /api/ai/gaps` - Detect knowledge gaps
**Request:**
```json
{
  "student_id": "uuid",
  "course_id": "uuid"
}
```

### Real-Time API

#### `POST /api/realtime` - Get real-time connection token
**Response:**
```json
{
  "token": "realtime_token",
  "expires_in": 3600
}
```

---

## Component Structure

### Pages (11 Implemented)

1. **`app/page.tsx`** - Landing/Login page
   - Login form with email/password
   - Sign-up form with role selection
   - Forgot password link
   - Terms of service

2. **`app/layout.tsx`** - Root layout
   - Wraps all pages
   - Loads theme provider
   - Loads auth context
   - Loads WebSocket connection
   - Includes global styles

3. **`app/dashboard/page.tsx`** - Main dashboard
   - Student: My courses, recent grades, upcoming deadlines
   - Instructor: My courses, student list, pending assignments
   - Admin: Platform stats, user management, revenue

4. **`app/courses/page.tsx`** - Course listing
   - Search and filter courses
   - Course cards with enrollment button
   - Pagination
   - Course preview

5. **`app/courses/[courseId]/page.tsx`** - Course detail
   - Course information and description
   - Instructor details
   - Enrolled student list (Instructor view)
   - Enrollment button (Student view)
   - List of lectures and assessments

6. **`app/lectures/page.tsx`** - Lecture listing
   - All lectures for student's courses
   - Filter by course
   - Mark as watched/unwatched
   - Search lectures

7. **`app/lectures/[lectureId]/page.tsx`** - Lecture player
   - Video player with controls
   - Lecture details and description
   - Watch percentage tracking
   - Attendance status
   - Comments section (optional)
   - Related lectures list

8. **`app/assessments/page.tsx`** - Assessment listing
   - All assessments for student
   - Filter by course, type, status
   - Submission status
   - View grades for completed assessments
   - Upcoming deadlines

9. **`app/enrollment/page.tsx`** - Enrollment management (Instructor)
   - View enrolled students per course
   - Add students manually
   - Bulk import students
   - Generate enrollment codes
   - Remove students
   - Export enrollment list

10. **`app/auth/forgot-password/page.tsx`** - Password recovery
    - Enter email
    - Send reset link
    - Confirmation message

11. **`app/auth/reset-password/page.tsx`** - Password reset
    - Validate reset token
    - Set new password
    - Login redirect

### UI Components (60+ shadcn/ui)

**Core Components:**
- Button, Card, Input, Label, Textarea
- Badge, Alert, Dialog, Dropdown Menu
- Form, Popover, Select, Switch
- Tabs, Accordion, Toast, Tooltip

**Custom Components (30+):**
- `PaymentButton` - Handle course enrollment payment
- `AITutorChat` - AI chatbot interface
- `CourseCard` - Display course preview
- `StatCard` - Display KPI stat
- `ProgressTracker` - Show course progress
- `VideoPlayer` - Embed video with controls
- `GradingInterface` - Grade submissions
- `AssessmentForm` - Create/edit assessments
- `AttendanceMarker` - Mark attendance
- `EnrollmentManager` - Manage student enrollment

### Library & Utilities

**Supabase Integration:**
- `/lib/supabase-client.ts` - Browser client (createClient)
- `/lib/supabase-server.ts` - Server client (createServerClient)
  
**Payment Processing:**
- `/lib/paystack.ts` - Paystack utility functions (initialize, verify, createSignature)

**AI Integration:**
- `/lib/ai-client.ts` - OpenAI integration (streamText, generateText)

**State Management:**
- `/lib/auth-context.tsx` - Auth state provider
- `/lib/theme-context.tsx` - Theme state provider

**Real-Time:**
- `/lib/websocket.ts` - WebSocket client setup
- `/hooks/use-websocket.ts` - Hook for WebSocket events

**Email:**
- `/lib/email-client.ts` - Resend email service

**Data Fetching:**
- `/hooks/use-courses.ts` - Fetch courses
- `/hooks/use-lectures.ts` - Fetch lectures
- `/hooks/use-realtime.ts` - Subscribe to realtime updates

---

## Authentication & Security

### Authentication Flow

1. **Sign Up**:
   ```
   User enters email/password
   → Validate input (email format, password strength)
   → Call Supabase Auth signUp()
   → Receive JWT access token & refresh token
   → Create profile record in database
   → Send verification email
   → Redirect to dashboard
   ```

2. **Sign In**:
   ```
   User enters email/password
   → Call Supabase Auth signInWithPassword()
   → Receive JWT access token & refresh token
   → Load user profile & role
   → Create session in browser storage
   → Redirect to appropriate dashboard
   ```

3. **Session Management**:
   ```
   JWT stored in httpOnly cookie (Supabase handles)
   → Auto-refresh token before expiry
   → Send JWT in Authorization header for API calls
   → Verify JWT on backend for protected routes
   ```

### Security Measures

1. **Password Security**:
   - Minimum 8 characters required
   - Hash with bcrypt (Supabase handles)
   - Never transmitted in plain text
   - Secure password reset via email link

2. **JWT Tokens**:
   - Short-lived access tokens (3600 seconds)
   - Refresh tokens stored securely
   - Token validation on every API request
   - Automatic token refresh

3. **Row-Level Security (RLS)**:
   ```sql
   -- Users can only access their own data
   CREATE POLICY "users_access_own_data" ON profiles
     FOR SELECT USING (auth.uid() = id);
   
   -- Instructors can only grade their courses
   CREATE POLICY "instructors_grade_own_courses" ON grades
     FOR INSERT WITH CHECK (
       EXISTS (
         SELECT 1 FROM courses 
         WHERE courses.id = grades.course_id
         AND courses.instructor_id = auth.uid()
       )
     );
   ```

4. **Input Validation**:
   - Zod schemas on frontend
   - Server-side validation on API routes
   - Sanitize all user inputs
   - Prevent SQL injection via parameterized queries

5. **API Security**:
   - CORS configured for allowed origins only
   - Rate limiting (middleware ready)
   - Webhook signature verification (Paystack)
   - HTTPS enforced in production
   - Security headers configured

6. **Payment Security**:
   - PCI-DSS compliant (via Paystack)
   - Never store card details
   - Webhook signature verification
   - Payment status validation
   - SSL/TLS for all payment data

---

## Integrations

### Supabase Integration

**Purpose**: Database, Authentication, Real-time

**Setup**:
1. Create project at supabase.com
2. Get Project URL and API Key
3. Set environment variables
4. Run migration scripts

**Features Used**:
- Auth (JWT-based)
- Database (PostgreSQL)
- Real-time (WebSocket)
- Row-Level Security (RLS)
- Database Functions
- Edge Functions (optional)

**Environment Variables**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
```

### Paystack Integration

**Purpose**: Payment processing

**Setup**:
1. Create merchant account at paystack.com
2. Get Test & Live API keys
3. Set environment variables
4. Configure webhook URL

**Payment Flow**:
1. Initialize payment → Get authorization URL
2. Customer enters details on Paystack
3. Webhook confirms payment
4. Auto-enroll student in course

**Environment Variables**:
```env
PAYSTACK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
```

**Webhook URL**: `https://yourdomain.com/api/payments/webhook`

### OpenAI Integration

**Purpose**: AI tutoring, content generation

**Models Used**:
- GPT-4 (primary, for tutor)
- GPT-3.5-turbo (fallback, for faster responses)

**Features**:
- Streaming text responses
- Token counting
- Error handling & fallbacks
- System prompts for context

**Environment Variables**:
```env
OPENAI_API_KEY=sk_xxxxx
```

### Vercel AI SDK

**Purpose**: Unified AI interface

**Providers Supported**:
- OpenAI (default)
- Anthropic (optional)
- Google Gemini (optional)
- Any other supported provider

**Installation**:
```bash
npm install ai @ai-sdk/openai
```

### Resend (Optional)

**Purpose**: Email notifications

**Features**:
- Enrollment confirmation
- Grade notification
- Assignment due reminder
- Password reset
- Welcome email

**Environment Variables**:
```env
RESEND_API_KEY=re_xxxxx
```

---

## Real-Time & WebSocket

### WebSocket Implementation

**Technology**: Supabase Realtime

**Connection**:
```typescript
// Browser automatically connects when page loads
// Realtime token obtained from /api/realtime
// Auto-reconnect on disconnect
// Fallback to polling if WebSocket unavailable
```

### Real-Time Events

1. **Lecture Watch Events**:
   ```
   Event: lecture:watching
   Data: {lecture_id, student_id, watch_percentage, timestamp}
   Receiver: Instructor (live attendance tracking)
   ```

2. **Grade Posted Events**:
   ```
   Event: grade:posted
   Data: {assessment_id, student_id, score, timestamp}
   Receiver: Student (instant notification)
   ```

3. **Enrollment Events**:
   ```
   Event: enrollment:new
   Data: {course_id, student_id, timestamp}
   Receiver: Instructor (new student notification)
   ```

4. **Announcement Events**:
   ```
   Event: announcement:new
   Data: {course_id, title, content, timestamp}
   Receiver: All enrolled students
   ```

### Polling Fallback

For browsers without WebSocket support:
```typescript
// Poll for updates every 5 seconds
// Check for new grades, announcements, etc.
// Update dashboard in real-time
// Less efficient but supports all browsers
```

---

## Deployment & Environment

### Deployment Platform: Vercel

**Why Vercel?**
- Optimized for Next.js
- Automatic scaling
- Edge Network (fast CDN)
- Built-in environment variables
- Zero-config deployments
- Free tier available

**Deployment Steps**:
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy (automatic on push)

### Environment Variables

**Required**:
```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx

# Payments (Required if using payments)
PAYSTACK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# AI (Required if using AI features)
OPENAI_API_KEY=sk_xxxxx

# Email (Optional)
RESEND_API_KEY=re_xxxxx
```

**Optional**:
```env
# Logging & Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Build & Deployment

**Development**:
```bash
pnpm dev  # Start dev server
```

**Production Build**:
```bash
pnpm build  # Build for production
pnpm start  # Start production server
```

**Database Migrations**:
```sql
-- Run in Supabase SQL Editor in order:
1. scripts/01-init-database.sql
2. scripts/02-functions-and-triggers.sql
3. scripts/03-row-level-security.sql
4. scripts/05-create-profiles-table.sql
5. scripts/06-create-payments-tables.sql
```

---

## File Structure

```
hamduk-vle/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── route.ts              # Authentication
│   │   ├── courses/
│   │   │   └── route.ts              # Course management
│   │   ├── lectures/
│   │   │   └── route.ts              # Lecture management
│   │   ├── attendance/
│   │   │   └── route.ts              # Attendance tracking
│   │   ├── assessments/
│   │   │   └── route.ts              # Assessment CRUD
│   │   ├── grades/
│   │   │   └── route.ts              # Grade management
│   │   ├── enrollment/
│   │   │   └── route.ts              # Student enrollment
│   │   ├── payments/
│   │   │   ├── initialize/
│   │   │   │   └── route.ts          # Init payment
│   │   │   ├── verify/
│   │   │   │   └── route.ts          # Verify payment
│   │   │   └── webhook/
│   │   │       └── route.ts          # Paystack webhook
│   │   ├── ai/
│   │   │   ├── tutor/
│   │   │   │   └── route.ts          # AI chat
│   │   │   ├── explain/
│   │   │   │   └── route.ts          # Concept explain
│   │   │   ├── summarize/
│   │   │   │   └── route.ts          # Summarize
│   │   │   ├── quiz/
│   │   │   │   └── route.ts          # Quiz generation
│   │   │   └── gaps/
│   │   │       └── route.ts          # Knowledge gaps
│   │   ├── emails/
│   │   │   └── send/
│   │   │       └── route.ts          # Send email
│   │   ├── notifications/
│   │   │   └── preferences/
│   │   │       └── route.ts          # Notification prefs
│   │   └── realtime/
│   │       └── route.ts              # Real-time token
│   ├── auth/
│   │   ├── forgot-password/
│   │   │   └── page.tsx              # Password recovery
│   │   ├── reset-password/
│   │   │   └── page.tsx              # Password reset
│   │   └── callback/
│   │       └── route.ts              # OAuth callback
│   ├── dashboard/
│   │   └── page.tsx                  # Main dashboard
│   ├── courses/
│   │   ├── page.tsx                  # Course listing
│   │   └── [courseId]/
│   │       └── page.tsx              # Course detail
│   ├── lectures/
│   │   ├── page.tsx                  # Lecture listing
│   │   └── [lectureId]/
│   │       └── page.tsx              # Lecture player
│   ├── assessments/
│   │   └── page.tsx                  # Assessment listing
│   ├── enrollment/
│   │   └── page.tsx                  # Enrollment management
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Login/Landing
│   ├── globals.css                   # Global styles
│   └── middleware.ts                 # Auth middleware
├── components/
│   ├── ui/                           # shadcn/ui components (60+)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── textarea.tsx
│   │   ├── tabs.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── select.tsx
│   │   ├── toast.tsx
│   │   └── ... (50+ more)
│   ├── payment-button.tsx            # Payment component
│   ├── ai-tutor-chat.tsx             # AI chat interface
│   ├── course-card.tsx               # Course preview card
│   ├── stat-card.tsx                 # KPI stat display
│   ├── progress-tracker.tsx          # Progress visualization
│   ├── video-player.tsx              # Video player
│   ├── grading-interface.tsx         # Grade submissions
│   ├── assessment-form.tsx           # Create assessments
│   ├── attendance-marker.tsx         # Mark attendance
│   ├── enrollment-manager.tsx        # Manage enrollment
│   ├── course-form.tsx               # Create/edit course
│   ├── header.tsx                    # Top navigation
│   ├── sidebar.tsx                   # Side navigation
│   ├── theme-provider.tsx            # Theme wrapper
│   ├── ai-concept-explainer.tsx      # Explain concepts
│   └── ... (10+ more custom components)
├── lib/
│   ├── supabase-client.ts            # Browser client
│   ├── supabase-server.ts            # Server client
│   ├── supabase.ts                   # Re-export utility
│   ├── auth-context.tsx              # Auth state
│   ├── theme-context.tsx             # Theme state
│   ├── websocket.ts                  # WebSocket setup
│   ├── paystack.ts                   # Payment utilities
│   ├── ai-client.ts                  # AI functions
│   ├── email-client.ts               # Email utilities
│   ├── utils.ts                      # Utility functions
│   ├── auth.ts                       # Auth utilities
│   └── api-client.ts                 # API client
├── hooks/
│   ├── use-websocket.ts              # WebSocket hook
│   ├── use-courses.ts                # Courses data hook
│   ├── use-lectures.ts               # Lectures data hook
│   ├── use-realtime.ts               # Real-time updates
│   ├── use-mobile.ts                 # Mobile detection
│   └── use-toast.ts                  # Toast notifications
├── public/
│   ├── lecture-video-player.jpg      # Placeholder image
│   ├── placeholder-logo.png          # Logo image
│   ├── placeholder-user.jpg          # User avatar image
│   ├── placeholder.jpg               # Generic image
│   └── ... (static assets)
├── scripts/
│   ├── 01-init-database.sql          # Core schema (1400+ lines)
│   ├── 02-functions-and-triggers.sql # DB functions & triggers
│   ├── 03-row-level-security.sql     # RLS policies
│   ├── 04-sample-data.sql            # Sample data
│   ├── 05-create-profiles-table.sql  # Profiles table
│   └── 06-create-payments-tables.sql # Payment tables
├── emails/
│   ├── enrollment-confirmation.tsx   # Enrollment email
│   ├── grade-notification.tsx        # Grade posted email
│   ├── assignment-due.tsx            # Due date reminder
│   └── ... (other email templates)
├── styles/
│   └── globals.css                   # Global styles
├── .env.example                      # Example env file
├── .gitignore                        # Git ignore rules
├── components.json                   # shadcn config
├── next.config.mjs                   # Next.js config
├── package.json                      # Dependencies
├── postcss.config.mjs                # PostCSS config
├── tailwind.config.js                # Tailwind config
├── tsconfig.json                     # TypeScript config
├── middleware.ts                     # Auth middleware
├── README.md                         # Project README
├── FEATURES_COMPLETED.md             # Feature summary
├── IMPLEMENTATION_PLAN.md            # Roadmap
├── DEPLOYMENT_GUIDE.md               # Deploy instructions
└── whatappentails.md                 # THIS FILE
```

---

## Key Statistics

| Metric | Count |
|--------|-------|
| **Pages** | 11 |
| **Custom Components** | 30+ |
| **UI Components (shadcn)** | 60+ |
| **API Routes** | 17 |
| **Database Tables** | 15+ |
| **Database Functions** | 5+ |
| **Database Triggers** | 5+ |
| **Custom Hooks** | 5+ |
| **SQL Migration Scripts** | 6 |
| **Lines of Database Schema** | 1400+ |
| **Total Code Lines** | 10,000+ |

---

## Security Checklist

- [x] Password hashing (bcrypt via Supabase)
- [x] JWT token validation
- [x] Row-Level Security (RLS) on all tables
- [x] CORS protection configured
- [x] SQL injection prevention (parameterized queries)
- [x] Input validation (Zod schemas)
- [x] Webhook signature verification
- [x] HTTPS enforced (Vercel)
- [x] API rate limiting ready (middleware)
- [x] Session timeout configured
- [x] Secure password reset flow
- [x] Email verification for new accounts

---

## Performance Optimizations

- [x] Next.js 15 with latest optimizations
- [x] Server-side rendering (SSR) for pages
- [x] Database query optimization with indexes
- [x] Connection pooling (Supabase)
- [x] Edge Network (Vercel CDN)
- [x] Image optimization
- [x] Code splitting & lazy loading
- [x] WebSocket with polling fallback
- [x] Caching strategies implemented
- [x] Database search optimization

---

## Scalability & Capacity

- **Concurrent Users**: 10,000+
- **Database**: Supabase auto-scales
- **API**: Vercel serverless (unlimited)
- **Storage**: Supabase PostgreSQL (unlimited)
- **Real-Time**: WebSocket with fallback
- **Email**: Resend (unlimited)
- **AI**: OpenAI API (rate limited, can be increased)

---

## Next Steps for Deployment

1. **Set Up Supabase**:
   - Create project at supabase.com
   - Get Project URL and API Key
   - Run SQL migration scripts

2. **Configure Payments**:
   - Create Paystack merchant account
   - Get API keys
   - Set webhook URL

3. **Set Up OpenAI**:
   - Create account at openai.com
   - Get API key

4. **Deploy to Vercel**:
   - Push code to GitHub
   - Connect to Vercel
   - Add environment variables
   - Deploy

5. **Post-Deployment**:
   - Test payment flow
   - Verify emails are sending
   - Check AI features
   - Monitor logs

---

## Support & Troubleshooting

**Common Issues**:
- Missing environment variables → Check .env
- Database connection error → Verify Supabase URL/Key
- Payment fails → Check Paystack keys & webhook URL
- AI not working → Verify OpenAI API key
- Real-time not updating → Check WebSocket connection

**Resources**:
- Supabase Docs: https://supabase.io/docs
- Next.js Docs: https://nextjs.org/docs
- Paystack Docs: https://paystack.com/docs
- OpenAI Docs: https://platform.openai.com/docs
- Vercel Docs: https://vercel.com/docs

---

**Built with ❤️ for Education in Africa**

Last Updated: 2024
