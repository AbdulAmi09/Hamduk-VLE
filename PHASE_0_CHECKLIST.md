# Phase 0 Implementation Checklist

## Pre-Migration (Do First)

### Planning & Preparation
- [ ] Read `PHASE_0_README.md` - Overview
- [ ] Read `PHASE_0_SUMMARY.md` - What's included
- [ ] Read `MIGRATION_SETUP.md` - Implementation guide
- [ ] Understand the 5 critical tasks
- [ ] Schedule migration during maintenance window
- [ ] Notify team of 2-3 minute downtime
- [ ] Prepare rollback plan
- [ ] Document current database state

### Backup & Testing
- [ ] **BACKUP DATABASE** - Essential!
  ```
  Supabase Dashboard → Settings → Backups → Backup now
  ```
- [ ] Verify backup completed successfully
- [ ] Check backup size matches expectations
- [ ] Note backup timestamp

### Environment Setup
- [ ] Verify Supabase project access
- [ ] Confirm correct Supabase URL
- [ ] Check API keys are valid
- [ ] Verify credentials have needed permissions
- [ ] Test local development environment
- [ ] Have Supabase dashboard open and ready
- [ ] Have SQL Editor tab open

---

## Migration Phase (In Order)

### Step 1: Access Supabase SQL Editor
- [ ] Go to https://supabase.com/dashboard
- [ ] Select your project
- [ ] Click "SQL Editor" in sidebar
- [ ] Click "New Query"

### Step 2: Load Migration SQL
- [ ] Open `scripts/002-phase-0-critical-fixes.sql`
- [ ] Copy entire file contents (425 lines)
- [ ] Paste into SQL Editor
- [ ] Verify no truncation (should be 425+ lines)
- [ ] Review SQL looks correct

### Step 3: Execute Migration
- [ ] Read through SQL one more time
- [ ] Take a screenshot of migration before running
- [ ] Click "RUN" button
- [ ] Watch for execution
- [ ] **Wait for completion** - Usually 30-90 seconds

### Step 4: Check for Errors
- [ ] Scroll through output
- [ ] Look for red error messages
- [ ] If errors found:
  - [ ] Note exact error message
  - [ ] Check error details
  - [ ] See "Troubleshooting" section below
  - [ ] Consider rollback if critical
- [ ] If no errors:
  - [ ] Proceed to verification
  - [ ] Document successful completion

---

## Verification Phase (Confirm Success)

### Verify Tables Created
```sql
-- Copy each query below and run individually
-- Each should return positive results
```

- [ ] Modules table created
  ```sql
  SELECT COUNT(*) FROM information_schema.tables 
  WHERE table_name = 'modules';
  -- Expected: 1
  ```

- [ ] Lesson progress table created
  ```sql
  SELECT COUNT(*) FROM information_schema.tables 
  WHERE table_name = 'lesson_progress';
  -- Expected: 1
  ```

- [ ] Two-factor auth table created
  ```sql
  SELECT COUNT(*) FROM information_schema.tables 
  WHERE table_name = 'two_factor_auth';
  -- Expected: 1
  ```

- [ ] Signup progress table created
  ```sql
  SELECT COUNT(*) FROM information_schema.tables 
  WHERE table_name = 'signup_progress';
  -- Expected: 1
  ```

### Verify Profile Columns
```sql
SELECT COUNT(*) FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('full_name', 'display_name', 'timezone', 'linkedin_url', 
                     'twitter_url', 'website_url', 'language_preference', 
                     'onboarding_completed');
-- Expected: 8
```

- [ ] All profile columns added
- [ ] Run above query
- [ ] Result should be 8

### Verify RLS Enabled
```sql
-- Check policies exist
SELECT COUNT(*) FROM pg_policies 
WHERE schemaname = 'public';
-- Expected: 60+
```

- [ ] RLS policies created
- [ ] Count should be 60 or more
- [ ] If less than 60: Something failed

### Verify Triggers
```sql
SELECT COUNT(*) FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'update_profiles_updated_at', 
                       'update_modules_updated_at', 'update_two_factor_auth_updated_at');
-- Expected: 4
```

- [ ] Triggers created
- [ ] All 4 triggers should exist
- [ ] Specifically `on_auth_user_created`

### Verify Indexes
```sql
SELECT COUNT(*) FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%';
-- Expected: 10+
```

- [ ] Performance indexes created
- [ ] At least 10 indexes present
- [ ] Query performance improved

---

## Application Code Testing

### TypeScript Files
- [ ] Check `lib/db-utils.ts`
  - [ ] Uses `profiles` table, not `users`
  - [ ] `getUserClasses()` uses subqueries
  - [ ] All imports correct

- [ ] Check `middleware.ts`
  - [ ] Environment variables correct:
    - [ ] `NEXT_PUBLIC_SUPABASE_URL`
    - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] No `SUPABASE_NEXT_PUBLIC_` prefix

- [ ] Check `app/onboarding/page.tsx`
  - [ ] File exists
  - [ ] Imports work
  - [ ] 3-step flow implemented

### Build Check
```bash
cd /vercel/share/v0-project
npm run build
```

- [ ] Build succeeds
- [ ] No TypeScript errors
- [ ] No warnings

---

## Functional Testing

### Create New User
- [ ] Go to http://localhost:3000
- [ ] Click "Sign Up"
- [ ] Enter:
  - [ ] Email: test@example.com
  - [ ] Password: TestPass123!
  - [ ] Full Name: Test User
  - [ ] Role: Student
- [ ] Submit form
- [ ] Check for confirmation message
- [ ] Verify email in database:
  ```sql
  SELECT * FROM auth.users WHERE email = 'test@example.com';
  ```
- [ ] Verify profile auto-created:
  ```sql
  SELECT * FROM profiles WHERE email = 'test@example.com';
  ```

### Test Onboarding Flow
- [ ] Confirm email (if required)
- [ ] Get redirected to `/onboarding`
- [ ] **Step 1: Role Selection**
  - [ ] See three role options
  - [ ] Click a role
  - [ ] Role saved to database
  - [ ] Can go back and change

- [ ] **Step 2: Profile Completion**
  - [ ] See form with fields
  - [ ] Enter full name
  - [ ] Enter display name
  - [ ] Select timezone
  - [ ] Submit form
  - [ ] See loading indicator

- [ ] **Step 3: Success**
  - [ ] See success message
  - [ ] Get redirected to `/dashboard`
  - [ ] Dashboard loads
  - [ ] User is logged in

### Verify Database State
```sql
-- Check new user profile
SELECT id, email, role, full_name, display_name, 
       timezone, onboarding_completed 
FROM profiles 
WHERE email = 'test@example.com';

-- Check should show:
-- - role: selected role
-- - full_name: entered name
-- - timezone: selected timezone
-- - onboarding_completed: true
```

- [ ] All fields correct
- [ ] Onboarding marked complete

### Test Returning User
- [ ] Sign out
- [ ] Sign in with same user
- [ ] Should go directly to `/dashboard`
- [ ] No onboarding retry

### Test Different Roles
- [ ] Create student account
  - [ ] Verify role = 'student'
- [ ] Create instructor account
  - [ ] Verify role = 'instructor'
- [ ] Create tutor account
  - [ ] Verify role = 'tutor'

### Test RLS Policies
- [ ] Create two user accounts
- [ ] User 1 tries to see User 2's profile
- [ ] Should get permission denied
- [ ] User 1 can see own profile
- [ ] User 1 can see public data (courses, badges)

---

## API Route Testing

### Test Core Routes
```bash
# Test each route that was fixed

GET /api/profiles/{userId}      # Get user profile
GET /api/classes                # List user classes
GET /api/modules                # List modules
GET /api/lessons/{lessonId}     # Get lesson
GET /api/assessments            # List assessments
POST /api/discussions           # Create discussion
GET /api/discussions            # List discussions
```

- [ ] All routes return data
- [ ] No "user" table errors
- [ ] Responses match expected format
- [ ] No permission errors for authorized users
- [ ] Permission errors for unauthorized users

### Monitor Logs
```
Supabase Dashboard → Logs
```

- [ ] Check for errors
- [ ] Look for RLS violations
- [ ] Search for "DENY" messages
- [ ] No authentication errors
- [ ] No critical issues

---

## Performance Testing

### Check Query Performance
```sql
-- Run slow query log
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE query LIKE '%lessons%' 
ORDER BY mean_time DESC LIMIT 10;
```

- [ ] Queries running < 100ms
- [ ] No full table scans
- [ ] Indexes being used
- [ ] No N+1 query patterns

### Load Test (Optional)
```bash
# Run load test if needed
ab -n 1000 -c 10 http://localhost:3000/api/classes
```

- [ ] Handles concurrent requests
- [ ] Response times < 200ms
- [ ] No database connection errors
- [ ] Memory usage stable

---

## Security Testing

### Test RLS
- [ ] Create two users
- [ ] User A tries to access User B's payment
  ```sql
  SELECT * FROM payments WHERE user_id != auth.uid();
  -- Should return: NO ROWS (permission denied)
  ```

- [ ] Admin can see all payments
  ```sql
  -- As admin user:
  SELECT * FROM payments;
  -- Should return: ALL ROWS
  ```

- [ ] Student can see own enrollment
  ```sql
  -- As student:
  SELECT * FROM class_enrollments 
  WHERE student_id = auth.uid();
  -- Should return: OWN ENROLLMENTS
  ```

### Test Rate Limiting
- [ ] Make 100 requests/second
- [ ] Should be rate limited
- [ ] No account takeover possible
- [ ] No SQL injection possible

### Test CORS
- [ ] Test from different domain
- [ ] Credentials properly handled
- [ ] No sensitive data exposed
- [ ] HTTPS required in production

---

## Post-Migration (Final Steps)

### Clean Up
- [ ] Delete test users
  ```sql
  DELETE FROM auth.users WHERE email LIKE 'test@%';
  DELETE FROM profiles WHERE email LIKE 'test@%';
  ```

- [ ] Clear test data
- [ ] Verify test records removed
- [ ] Check no test artifacts remain

### Document Changes
- [ ] Update team on completion
- [ ] Share this checklist with team
- [ ] Document any issues encountered
- [ ] Note any custom modifications made
- [ ] Update internal documentation

### Monitor Production
- [ ] Watch error logs for 24 hours
- [ ] Monitor database performance
- [ ] Check user signup completion rate
- [ ] Track any issues
- [ ] Be ready to rollback if needed

### Mark as Complete
- [ ] All checks passed
- [ ] Users can sign up and onboard
- [ ] API routes working
- [ ] RLS policies enforced
- [ ] Performance acceptable
- [ ] No critical issues
- [ ] ✅ Phase 0 COMPLETE

---

## Troubleshooting

### Migration Failed

**Problem**: "duplicate key value violates unique constraint"
- [ ] Don't run migration twice
- [ ] Check if already ran
- [ ] Restore from backup if needed
- [ ] Run migration once per environment

**Problem**: "permission denied for schema public"
- [ ] Use service_role key, not anon_key
- [ ] Check user has CREATE/ALTER permissions
- [ ] Contact Supabase support if needed

**Problem**: "RLS is not enabled"
- [ ] Check that RLS was enabled in migration
- [ ] Query: `SELECT * FROM pg_class WHERE relname = 'users' AND relrowsecurity;`
- [ ] If false, manually enable RLS

**Problem**: "Relation does not exist"
- [ ] Migration didn't complete
- [ ] Check for errors in output
- [ ] Look at specific error message
- [ ] Re-run migration or restore backup

### Signup Issues

**Problem**: "Profile not created automatically"
- [ ] Check trigger exists: `on_auth_user_created`
- [ ] Verify trigger fires on INSERT
- [ ] Check trigger function: `handle_new_user()`
- [ ] May need to manually create profile

**Problem**: "Onboarding page not loading"
- [ ] Check file exists: `app/onboarding/page.tsx`
- [ ] Verify TypeScript syntax
- [ ] Check imports are correct
- [ ] Run `npm run build` to check

**Problem**: "User can't access dashboard after onboarding"
- [ ] Check `onboarding_completed` is set to true
- [ ] Verify page.tsx redirect logic
- [ ] Check user role is set
- [ ] Look at browser console for errors

### API Route Issues

**Problem**: "404 on API route"
- [ ] Check file path: `/app/api/endpoint/route.ts`
- [ ] Verify method (GET, POST, etc.)
- [ ] Check for typos in route name
- [ ] Restart dev server

**Problem**: "RLS blocking valid requests"
- [ ] Check RLS policy allows the operation
- [ ] Verify user ID matches auth.uid()
- [ ] Check role is correct
- [ ] May need to adjust policy

**Problem**: "Wrong table name"
- [ ] Check using `profiles`, not `users`
- [ ] Verify table exists
- [ ] Check column names match
- [ ] May need to update query

---

## Success Criteria

All of these must be true:

- [ ] Migration ran without errors
- [ ] All verification queries passed
- [ ] Tables created correctly
- [ ] Columns added to profiles
- [ ] Triggers created and functional
- [ ] Indexes created for performance
- [ ] RLS policies in place
- [ ] New user can sign up
- [ ] User redirected to onboarding
- [ ] Onboarding 3-step flow works
- [ ] Profile saved correctly
- [ ] User can access dashboard
- [ ] API routes return data
- [ ] RLS blocks unauthorized access
- [ ] No errors in logs
- [ ] Performance is acceptable
- [ ] Builds without errors
- [ ] Team notified of completion

---

## Sign-Off

- [ ] Completed by: __________________
- [ ] Date: __________________
- [ ] Verified by: __________________
- [ ] Status: ✅ COMPLETE

---

## Next Steps

Once Phase 0 is complete:
1. Plan Phase 1 (Payments & Live Sessions)
2. Begin Phase 1 development
3. Schedule Phase 1 migration
4. Continue monitoring Phase 0

**Congratulations! Phase 0 is complete.**

Your platform now has:
- ✅ Secure data access (RLS)
- ✅ Consistent user system
- ✅ Guided onboarding
- ✅ Working API routes
- ✅ Performance optimization

Ready for Phase 1 and beyond!
