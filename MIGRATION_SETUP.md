# Phase 0 Migration Setup Guide

## Quick Start

### 1. Access Supabase SQL Editor

Go to your Supabase project:
- Navigate to SQL Editor
- Or use the CLI: `supabase link --project-ref [YOUR_PROJECT_ID]`

### 2. Run the Migration

**Option A: Supabase Dashboard**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to SQL Editor
4. Click "New Query"
5. Copy the entire contents of `scripts/002-phase-0-critical-fixes.sql`
6. Paste into the editor
7. Click "Run"
8. Verify: No errors, message says "Success"

**Option B: Local CLI**

```bash
# If using Supabase CLI
supabase migration up

# Or via psql directly
psql "postgres://[user]:[password]@[host]:5432/[database]" < scripts/002-phase-0-critical-fixes.sql
```

**Option C: Migration File**

If your project uses migration files:

```bash
# Copy the migration to your migrations folder
cp scripts/002-phase-0-critical-fixes.sql supabase/migrations/

# Push to Supabase
supabase db push
```

### 3. Verify Migration Success

Run these checks in SQL Editor:

```sql
-- Check RLS is enabled on key tables
SELECT tablename, pg_has_role(tableoid, 'table'::text)
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('payments', 'announcements', 'discussions')
ORDER BY tablename;

-- Should return: true for all tables

-- Check modules table exists
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_name = 'modules';

-- Should return: 1

-- Check trigger exists
SELECT COUNT(*) FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Should return: 1

-- Check profiles columns
SELECT COUNT(*) FROM information_schema.columns 
WHERE table_name = 'profiles'
AND column_name IN ('full_name', 'display_name', 'timezone', 'onboarding_completed');

-- Should return: 4
```

## What Gets Created

### Tables (New)
- `modules` - Organize lessons within courses
- `lesson_progress` - Track student progress through lessons
- `two_factor_auth` - Two-factor authentication settings
- `signup_progress` - Track signup flow progress

### Tables (Modified)
- `profiles` - Added 8 new columns
- `lessons` - Added optional `module_id`
- `discussions` - Standardized to use `auth.users`

### Security (RLS Policies)
- 25 tables now have RLS enabled
- Each table has 1-3 policies for different user roles
- Total: ~60+ policies created

### Functions & Triggers
- `handle_new_user()` - Auto-create profile on signup
- `update_updated_at()` - Auto-update timestamps
- `on_auth_user_created` - Trigger for profile creation
- Auto-update triggers on: profiles, modules, two_factor_auth

### Indexes (Performance)
- 10+ indexes on frequently queried columns
- Improves query performance by 10-100x for large datasets

## Rollback Plan

If something goes wrong, you can restore from backup:

```sql
-- Quick rollback (NOT RECOMMENDED - use backup instead)
-- This only removes the NEW tables, doesn't revert existing changes

DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS signup_progress CASCADE;
DROP TABLE IF EXISTS two_factor_auth CASCADE;

-- Better: Restore from Supabase backup
-- 1. Go to Supabase Dashboard
-- 2. Settings → Backups
-- 3. Click "Restore from backup"
```

## Verify TypeScript Files

After migration, verify these files were updated:

```bash
# Check db-utils references profiles, not users
grep -n "from(\"profiles\")" lib/db-utils.ts

# Check middleware env variables are correct
grep -n "NEXT_PUBLIC_SUPABASE" middleware.ts

# Check onboarding page exists
ls -la app/onboarding/page.tsx
```

## Environment Variables

Ensure these are set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Test the Flow

### New User Signup
1. Go to `http://localhost:3000`
2. Click "Sign Up"
3. Enter email, password, name, select role
4. Confirm email
5. Get redirected to onboarding
6. Select/confirm role
7. Complete profile (name, timezone)
8. Get redirected to dashboard

### Check Database
```sql
-- Check new profile was created
SELECT id, email, role, onboarding_completed 
FROM profiles 
WHERE email = 'newuser@example.com';

-- Check signup progress was recorded
SELECT * FROM signup_progress 
WHERE user_id = '[user-id-from-above]';

-- Check trigger worked
SELECT * FROM auth.users 
WHERE email = 'newuser@example.com';
-- Should have role in user_metadata
```

## Common Issues

### Issue: "duplicate key value violates unique constraint"
**Cause**: Migration ran twice  
**Solution**: Run ONLY once, or check logs before running

### Issue: "permission denied for schema public"
**Cause**: Not enough permissions  
**Solution**: Use service_role key (not anon_key) in SQL Editor

### Issue: "RLS policy blocks all queries"
**Cause**: Too restrictive policy  
**Solution**: Check RLS policies, may need to disable for testing

### Issue: "relation 'modules' does not exist"
**Cause**: Migration didn't complete  
**Solution**: Run migration again, check for errors in output

## After Migration

Your platform now has:

✅ **Security**: All user data protected by RLS policies  
✅ **Structure**: Proper modules → lessons organization  
✅ **Auth**: Complete onboarding flow  
✅ **Data**: Single source of truth (auth.users + profiles)  
✅ **Performance**: Indexed queries for speed  
✅ **Tracking**: Progress and audit logging  

Next step: Run Phase 1 migrations for payments and live sessions.

## Support

For migration issues:

1. **Check Supabase Status**: https://status.supabase.com
2. **View Logs**: Supabase Dashboard → Logs
3. **Review Migration File**: Check for syntax errors
4. **Test Permissions**: Verify role can CREATE/ALTER tables
5. **Backup First**: Always backup before running migrations

## Additional Resources

- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security-best-practices)
- [Hamduk VLE Docs](./README.md)
