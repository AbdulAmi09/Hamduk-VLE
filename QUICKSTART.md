# Hamduk VLE - Quick Start Guide

## 60-Second Setup

### Step 1: Database
1. Open Supabase Dashboard
2. Go to SQL Editor → New Query
3. Copy entire content from `/scripts/migrations.sql`
4. Click **RUN** button
5. Wait for success message

### Step 2: Environment
Add to `.env.development.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SUPABASE_SERVICE_ROLE_KEY=[your-service-role]
RESEND_API_KEY=re_[your-resend-key]
PAYSTACK_SECRET_KEY=sk_test_[your-key]
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_[your-key]
```

### Step 3: Start
```bash
npm run dev
```

Open http://localhost:3000

---

## What's Ready to Use

### All 42+ API Endpoints
- Authentication (2FA, sessions, login history)
- User profiles & institutions
- Notifications & preferences
- Announcements, discussions, messages
- Gamification (XP, badges, leaderboards)
- Certificates
- Live sessions
- Admin dashboard

### Components
- `NotificationCenter` - Bell icon with notifications
- `GamificationStats` - XP, level, badges display

### Database
- 29 tables with RLS policies
- All types defined
- Ready for frontend

---

## Test an Endpoint

```bash
# Get notifications
curl http://localhost:3000/api/notifications \
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN"

# Response: 
{
  "notifications": [],
  "unreadCount": 0
}
```

---

## Documentation

| File | Purpose |
|------|---------|
| `IMPLEMENTATION_GUIDE.md` | Detailed setup & architecture |
| `API_REFERENCE.md` | All endpoints with examples |
| `FEATURES_SUMMARY.md` | What's included |
| `CHANGES.md` | All files created |

---

## Common Tasks

### Add a New API Endpoint
1. Create file: `/app/api/feature/route.ts`
2. Import: `import { supabase, supabaseAdmin } from '@/lib/db'`
3. Add logic and response
4. Done - it's automatically routable

### Create Notification
```typescript
import { createNotification } from '@/lib/db';

await createNotification({
  user_id: userId,
  type: 'grade',
  title: 'Grade Released',
  message: 'Your assessment was graded',
  read: false,
});
```

### Get User Stats
```typescript
const { data: stats } = await fetch('/api/gamification/stats').then(r => r.json());
// Returns: { xp, level, streak, badges }
```

### Create Live Session
```typescript
const response = await fetch('/api/live-sessions', {
  method: 'POST',
  body: JSON.stringify({
    courseId: 'uuid',
    title: 'Calculus Class',
    scheduledStart: '2024-01-15T14:00:00Z',
    scheduledEnd: '2024-01-15T15:00:00Z'
  })
});
```

---

## Database

All tables are ready to query via Supabase:

```typescript
// Get notifications
const { data } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId);

// Create announcement
const { error } = await supabaseAdmin
  .from('announcements')
  .insert([{
    course_id: courseId,
    instructor_id: userId,
    title: 'Important Update',
    content: 'HTML content here'
  }]);

// Award badge
const { error } = await supabaseAdmin
  .from('user_badges')
  .insert([{
    user_id: userId,
    badge_id: badgeId
  }]);
```

---

## File Locations

**New API Routes:**
```
/app/api/
├── auth/2fa/setup
├── auth/2fa/verify
├── auth/sessions
├── auth/login-history
├── profiles
├── notifications
├── announcements
├── discussions
├── messages
├── gamification/stats
├── gamification/leaderboard
├── certificates
├── institutions
├── live-sessions
└── admin/dashboard
```

**Database:**
- Utilities: `/lib/db.ts`
- Schema: `/scripts/migrations.sql`

**Components:**
- `/components/notification-center.tsx`
- `/components/gamification-stats.tsx`

---

## Next: Build Your UI

All data is ready. Now build pages using these components:

```typescript
// Example: Profile Page
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch('/api/profiles?userId=YOUR_ID')
      .then(r => r.json())
      .then(data => setProfile(data.profile));
  }, []);

  return (
    <div>
      <h1>{profile?.full_name}</h1>
      <p>{profile?.bio}</p>
    </div>
  );
}
```

---

## Troubleshooting

**Migration fails?**
- Check Supabase credentials
- Ensure you're in correct project
- Try each statement individually

**API returns 401?**
- Add Authorization header
- Check Supabase token is valid

**Notifications not showing?**
- Verify notification_preferences table
- Check user_id is correct
- Enable Resend in env vars

**Email not sending?**
- Verify RESEND_API_KEY
- Check Resend domain verification
- Review error logs

---

## Production Deployment

1. **Database**: Run migrations on production Supabase
2. **Environment**: Set all env vars in Vercel
3. **Build**: `npm run build`
4. **Deploy**: Push to main branch
5. **Monitor**: Watch error logs

---

## Support

- Docs: See files in project root
- API Docs: `/API_REFERENCE.md`
- Implementation: `/IMPLEMENTATION_GUIDE.md`
- Changes: `/CHANGES.md`

**Status**: All backend ready ✅
**Next**: Build frontend pages 🚀

---

Happy coding! 🎉
