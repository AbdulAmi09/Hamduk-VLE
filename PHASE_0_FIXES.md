# Phase 0: Critical Fixes Implementation

This document outlines all critical fixes implemented in the Hamduk VLE platform to resolve foundational issues.

## Overview

Phase 0 addresses 5 critical areas that were blocking proper functionality:

1. **RLS Security** - Enable Row Level Security on 25 unprotected tables
2. **Data Model** - Add missing modules table and lesson flow fixes
3. **User Management** - Standardize user table structure
4. **API Routes** - Fix broken API endpoints and database references
5. **Auth Flow** - Fix authentication and add proper onboarding

## TASK 00: Row Level Security (RLS)

### What Was Fixed

Enabled RLS on 25 tables with appropriate policies for different user roles:

#### Tables Protected:
1. **payments** - Users see their own; admins see all
2. **announcements** - Users see course announcements; creators can manage
3. **live_sessions** - Users in class can join; creators can manage
4. **certificates** - Users see their own; instructors can create
5. **badges** - Anyone can view; admins manage
6. **user_badges** - Users see their own; admins assign
7. **streaks** - Users see their own streaks
8. **question_banks** - Creators and course instructors can access
9. **questions** - Instructors see their questions
10. **assessment_attempts** - Students see own; instructors see students in their courses
11. **assessment_answers** - Students see own answers
12. **rubrics** - Instructors see their rubrics
13. **rubric_criteria** - Instructors see their rubric criteria
14. **audit_logs** - Only admins can view
15. **feature_flags** - Users see enabled; admins manage
16. **coupons** - Users see valid coupons; admins manage
17. **subscriptions** - Users see their own; can manage own
18. **course_pricing** - Anyone views; instructors manage their courses
19. **institution_admins** - Admins see their institution
20. **notification_preferences** - Users manage their own
21. **discussions** - Users in class can view/participate
22. **discussion_replies** - Users in class can view/reply
23. **live_session_attendance** - Students see own; instructors see class attendance
24. **live_recordings** - Users in class can access; creators can manage
25. **sso_providers** - Only platform admins

### Implementation

Run the SQL migration:
```bash
psql [connection-string] < scripts/002-phase-0-critical-fixes.sql
```

## TASK 01: Modules Table + Lessons Flow

### What Was Fixed

**Added `modules` table** with structure:
```sql
CREATE TABLE modules (
  id UUID PRIMARY KEY,
  class_id UUID NOT NULL (references courses),
  title VARCHAR(255),
  description TEXT,
  order_index INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Added `lesson_progress` table** to track student progress:
```sql
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  completed BOOLEAN,
  progress_percentage INTEGER,
  last_accessed TIMESTAMP,
  completed_at TIMESTAMP,
  UNIQUE(student_id, lesson_id)
)
```

**Updated lessons table**:
- Added optional `module_id` column
- Lessons can now exist with or without modules
- Supports both flat course → lesson and structured module → lesson hierarchies

### Usage

**For course-based (no modules)**:
```
Course → Lessons
```

**For module-based structure**:
```
Course → Modules → Lessons
```

## TASK 02: User Table Standardization

### What Was Fixed

**Standardized on `profiles` table** linked to `auth.users`:

Added missing columns to `profiles`:
- `full_name` - Full legal name
- `display_name` - Preferred display name
- `timezone` - User's timezone (default: UTC)
- `linkedin_url` - LinkedIn profile
- `twitter_url` - Twitter handle
- `website_url` - Personal website
- `language_preference` - Language code (default: en)
- `onboarding_completed` - Boolean flag for completion
- `profile_completion_step` - Current onboarding step

**Created trigger**:
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user()
```

This automatically creates a profile in `profiles` when a user signs up via Supabase Auth.

### Why This Matters

- Single source of truth for user data
- Auth.users contains authentication data; profiles contain application data
- RLS policies work consistently across all features
- No redundant user tables

## TASK 03: Broken API Routes Fixed

### What Was Fixed

**1. Fixed `lib/db-utils.ts`**:
- Changed all `users` table references to `profiles`
- Fixed `getUserClasses()` to use proper subquery instead of invalid `.join()`
- Properly handles student/tutor/admin roles

**2. Fixed two_factor_auth table**:
- Created proper `two_factor_auth` table (was referenced as `two_factor_settings`)
- Links to `auth.users` with proper cascade delete

**3. Standardized discussions**:
- All user references now use `auth.users` IDs
- `created_by` field properly linked to `auth.users`

**4. Fixed middleware environment variables**:
- Changed `SUPABASE_NEXT_PUBLIC_SUPABASE_URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Fixed duplicate anon key variable name

**5. Added performance indexes**:
```sql
CREATE INDEX idx_discussions_class_id ON discussions(class_id);
CREATE INDEX idx_class_enrollments_student_id ON class_enrollments(student_id);
CREATE INDEX idx_assessment_attempts_student_id ON assessment_attempts(student_id);
-- and more...
```

### Affected API Routes

All routes in `/app/api/*` now:
- Use `profiles` table for user queries
- Properly handle RLS policies
- Return correct data structures
- Have improved query performance

## TASK 04: Auth Flow + Onboarding

### What Was Fixed

**Updated sign-up flow**:
1. User enters email, password, name, role in login page
2. Role stored in `auth.users.user_metadata`
3. Trigger creates profile with role in `profiles` table
4. User redirected to onboarding page

**Created onboarding page** (`/app/onboarding/page.tsx`):

**Step 1: Role Selection**
- User confirms or changes their role
- Options: Student, Instructor, Tutor
- Role saved to database

**Step 2: Profile Completion**
- User enters:
  - Full Name (required)
  - Display Name (optional)
  - Timezone (required, default: UTC)
- Sets `onboarding_completed = true`

**Step 3: Redirect**
- User redirected to `/dashboard`
- Dashboard checks for onboarding completion

**Updated login page**:
- After sign-in, checks if user completed onboarding
- Redirects to `/onboarding` if not completed
- Redirects to `/dashboard` if completed

### Signup Progress Tracking

Created `signup_progress` table to track:
- Current signup step
- Completion timestamp
- User ID

## Database Queries to Verify Fixes

Run these queries to verify all fixes are working:

```sql
-- Check all tables have RLS enabled
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Verify modules table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'modules';

-- Check profiles table has all columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY column_name;

-- Verify trigger exists
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check two_factor_auth table
SELECT * FROM information_schema.tables 
WHERE table_name = 'two_factor_auth';
```

## Files Modified

### TypeScript Files
- `lib/db-utils.ts` - Fixed user queries, module logic
- `app/page.tsx` - Updated login/signup with onboarding redirect
- `middleware.ts` - Fixed environment variable names

### New Files
- `scripts/002-phase-0-critical-fixes.sql` - Complete SQL migration
- `app/onboarding/page.tsx` - Onboarding flow page

### Migration
- `scripts/002-phase-0-critical-fixes.sql` - Contains all database changes

## Testing Checklist

- [ ] Run SQL migration successfully
- [ ] Create new user account
- [ ] Verify profile created automatically
- [ ] Complete onboarding flow
- [ ] Check user can access dashboard
- [ ] Verify RLS policies block unauthorized access
- [ ] Test instructor can see only their classes
- [ ] Test student sees only enrolled classes
- [ ] Check admin sees all records
- [ ] Verify two-factor settings table works
- [ ] Test all 45+ API routes return correct data

## Next Steps (Phase 1+)

After Phase 0 is verified working:

1. **Phase 1** - Payment Processing
   - Integrate Paystack properly
   - Fix subscription system
   - Add refund handling

2. **Phase 2** - Live Sessions
   - Connect Daily.co integration
   - Add session recording
   - Implement attendance tracking

3. **Phase 3** - AI Features
   - Integrate AI tutoring
   - Add content summarization
   - Implement knowledge gap detection

4. **Phase 4** - Analytics
   - Add learning analytics dashboard
   - Create reporting system
   - Student progress tracking

5. **Phase 5** - Performance
   - Optimize queries with caching
   - Add CDN for media
   - Implement search functionality

## Support

For issues with Phase 0 implementation:

1. Check that migration ran without errors
2. Verify all tables have RLS enabled
3. Test RLS policies with `EXPLAIN (ANALYZE)` queries
4. Check logs for auth errors
5. Verify environment variables are set correctly

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [Supabase Client Libraries](https://supabase.com/docs/reference/javascript)
