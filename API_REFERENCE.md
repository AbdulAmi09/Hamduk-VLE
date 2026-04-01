# Hamduk VLE - API Reference

## Base URL
```
/api
```

## Authentication
All endpoints require Supabase authentication unless noted as public.

## Error Responses
All endpoints return JSON with standard format:
```json
{
  "error": "Error message",
  "status": 400
}
```

---

## Authentication Endpoints

### Setup Two-Factor Authentication
```
POST /auth/2fa/setup
Authorization: Required

Request:
{
  "userId": "uuid"
}

Response:
{
  "secret": "base32_string",
  "qrCode": "data:image/png;base64,..."
  "backupCodes": ["CODE1", "CODE2", ...]
}
```

### Verify 2FA Token
```
POST /auth/2fa/verify
Authorization: Required

Request:
{
  "userId": "uuid",
  "token": "123456"
}

Response:
{
  "success": true,
  "message": "2FA verified and enabled"
}
```

### List Active Sessions
```
GET /auth/sessions
Authorization: Required

Response:
{
  "sessions": [
    {
      "id": "uuid",
      "user_agent": "Mozilla/5.0...",
      "ip_address": "192.168.1.1",
      "last_activity": "2024-01-01T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "expires_at": "2024-02-01T00:00:00Z"
    }
  ]
}
```

### Revoke Session
```
DELETE /auth/sessions
Authorization: Required

Request:
{
  "sessionId": "uuid"
}

Response:
{
  "success": true,
  "message": "Session revoked"
}
```

### Get Login History
```
GET /auth/login-history
Authorization: Required

Response:
{
  "total": 50,
  "successful": 45,
  "failed": 5,
  "recentLogins": [
    {
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "attempted_at": "2024-01-01T00:00:00Z"
    }
  ],
  "failedAttempts": []
}
```

---

## Profile Endpoints

### Get User Profile
```
GET /profiles?userId=<uuid>&public=false
Authorization: Required (for own data or admin)

Response:
{
  "profile": {
    "id": "uuid",
    "full_name": "John Doe",
    "avatar_url": "https://...",
    "bio": "Learning enthusiast",
    "xp_points": 5000,
    "badges": ["badge1", "badge2"],
    "role": "student",
    "email": "john@example.com",
    "phone": "+1234567890",
    "country": "NG",
    "timezone": "Africa/Lagos"
  }
}
```

### Update Profile
```
PUT /profiles
Authorization: Required

Request:
{
  "userId": "uuid",
  "full_name": "John Doe",
  "avatar_url": "https://...",
  "bio": "Learning enthusiast",
  "phone": "+1234567890",
  "country": "NG",
  "timezone": "Africa/Lagos"
}

Response:
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

## Notification Endpoints

### Get Notifications
```
GET /notifications
Authorization: Required

Response:
{
  "notifications": [
    {
      "id": "uuid",
      "type": "grade",
      "title": "Grade Released",
      "message": "Your Math assessment has been graded",
      "related_id": "uuid",
      "related_type": "assessment",
      "read": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "unreadCount": 5
}
```

### Create Notification
```
POST /notifications
Authorization: Required (admin/system)

Request:
{
  "userId": "uuid",
  "type": "grade|announcement|message|live_session|discussion",
  "title": "Notification Title",
  "message": "Notification message",
  "relatedId": "uuid",
  "relatedType": "course|assessment|lecture",
  "sendEmail": true,
  "userEmail": "user@example.com"
}

Response:
{
  "success": true,
  "message": "Notification created"
}
```

### Mark Notification as Read
```
PUT /notifications/{id}/read
Authorization: Required

Response:
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## Communication Endpoints

### Get Announcements
```
GET /announcements?courseId=<uuid>&institutionId=<uuid>
Authorization: Required

Response:
{
  "announcements": [
    {
      "id": "uuid",
      "course_id": "uuid",
      "instructor_id": "uuid",
      "title": "Important Update",
      "content": "HTML content",
      "is_pinned": true,
      "visibility": "all",
      "posted_date": "2024-01-01T00:00:00Z",
      "expires_at": null,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Announcement
```
POST /announcements
Authorization: Required (instructor)

Request:
{
  "courseId": "uuid",
  "title": "Announcement Title",
  "content": "HTML content",
  "visibility": "all|instructors_only",
  "expiresAt": "2024-02-01T00:00:00Z"
}

Response:
{
  "success": true,
  "message": "Announcement created"
}
```

### Get Discussions
```
GET /discussions?lectureId=<uuid>&courseId=<uuid>
Authorization: Required

Response:
{
  "discussions": [
    {
      "id": "uuid",
      "lecture_id": "uuid",
      "course_id": "uuid",
      "user_id": "uuid",
      "title": "Question about derivatives",
      "content": "Can someone explain...",
      "is_question": true,
      "is_answered": false,
      "reply_count": 3,
      "created_at": "2024-01-01T00:00:00Z",
      "profiles": {
        "full_name": "John Doe",
        "avatar_url": "https://..."
      }
    }
  ]
}
```

### Create Discussion
```
POST /discussions
Authorization: Required (enrolled student)

Request:
{
  "lectureId": "uuid",
  "courseId": "uuid",
  "title": "Question title",
  "content": "Question content",
  "isQuestion": true
}

Response:
{
  "success": true,
  "message": "Discussion created"
}
```

### Get Direct Messages
```
GET /messages?recipientId=<uuid>
Authorization: Required

Response:
{
  "messages": [
    {
      "id": "uuid",
      "sender_id": "uuid",
      "recipient_id": "uuid",
      "message": "Hello!",
      "is_read": false,
      "created_at": "2024-01-01T00:00:00Z",
      "sender": {
        "full_name": "John Doe",
        "avatar_url": "https://..."
      },
      "recipient": {
        "full_name": "Jane Doe",
        "avatar_url": "https://..."
      }
    }
  ],
  "conversations": []
}
```

### Send Direct Message
```
POST /messages
Authorization: Required

Request:
{
  "recipientId": "uuid",
  "message": "Hello Jane!"
}

Response:
{
  "success": true,
  "message": "Message sent"
}
```

---

## Gamification Endpoints

### Get User Stats
```
GET /gamification/stats
Authorization: Required

Response:
{
  "xp": 5000,
  "level": 5,
  "nextLevelXP": 6000,
  "currentLevelProgress": 1000,
  "streak": {
    "current": 15,
    "longest": 30,
    "lastActivity": "2024-01-01"
  },
  "badges": [
    {
      "id": "uuid",
      "earned_at": "2024-01-01T00:00:00Z",
      "badges": {
        "name": "First Step",
        "description": "Complete your first course"
      }
    }
  ],
  "totalBadges": 3
}
```

### Get Leaderboard
```
GET /gamification/leaderboard?courseId=<uuid>&type=course
Authorization: Required

Query Parameters:
- courseId (optional, required for course type)
- institutionId (optional, required for institution type)
- type: "course" | "institution" | "global"

Response:
{
  "leaderboard": [
    {
      "rank": 1,
      "student_id": "uuid",
      "full_name": "John Doe",
      "avatar_url": "https://...",
      "course_gpa": 3.8,
      "xp_points": 8000
    }
  ],
  "total": 50
}
```

---

## Certificate Endpoints

### Get Certificates
```
GET /certificates?courseId=<uuid>
Authorization: Required

Response:
{
  "certificates": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "course_id": "uuid",
      "certificate_number": "HAMDUK-...",
      "issue_date": "2024-01-01T00:00:00Z",
      "verification_token": "token",
      "public_url": "/certificates/verify/token",
      "is_revoked": false,
      "courses": {
        "title": "Advanced Mathematics"
      }
    }
  ]
}
```

### Generate Certificate
```
POST /certificates
Authorization: Required (admin/instructor)

Request:
{
  "studentId": "uuid",
  "courseId": "uuid"
}

Response:
{
  "success": true,
  "message": "Certificate generated",
  "certificateNumber": "HAMDUK-..."
}
```

---

## Institution Endpoints

### Get Institutions
```
GET /institutions
Authorization: Required

Response:
{
  "institutions": [
    {
      "id": "uuid",
      "name": "State University",
      "country": "NG",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Institution
```
POST /institutions
Authorization: Required

Request:
{
  "name": "State University",
  "country": "NG"
}

Response:
{
  "success": true,
  "institution": {
    "id": "uuid",
    "name": "State University",
    "country": "NG"
  },
  "message": "Institution created"
}
```

---

## Live Session Endpoints

### Get Live Sessions
```
GET /live-sessions?courseId=<uuid>&status=<status>
Authorization: Required

Query Parameters:
- courseId (optional)
- status: "scheduled" | "ongoing" | "completed" | "cancelled"

Response:
{
  "sessions": [
    {
      "id": "uuid",
      "course_id": "uuid",
      "instructor_id": "uuid",
      "title": "Calculus Live Class",
      "scheduled_start": "2024-01-15T14:00:00Z",
      "scheduled_end": "2024-01-15T15:00:00Z",
      "daily_room_url": "https://hamduk.daily.co/...",
      "status": "scheduled",
      "instructor": {
        "full_name": "Prof. Smith",
        "avatar_url": "https://..."
      }
    }
  ]
}
```

### Create Live Session
```
POST /live-sessions
Authorization: Required (instructor)

Request:
{
  "courseId": "uuid",
  "title": "Calculus Live Class",
  "description": "Advanced calculus topics",
  "scheduledStart": "2024-01-15T14:00:00Z",
  "scheduledEnd": "2024-01-15T15:00:00Z",
  "isRecurring": false,
  "maxParticipants": 50
}

Response:
{
  "success": true,
  "message": "Live session created",
  "roomName": "session-..."
}
```

---

## Admin Endpoints

### Get Dashboard
```
GET /admin/dashboard
Authorization: Required (admin only)

Response:
{
  "metrics": {
    "totalUsers": 1250,
    "totalCourses": 45,
    "totalAssessments": 230,
    "totalInstitutions": 8,
    "totalRevenue": 125000.00,
    "paymentsCount": 450
  },
  "recentActivity": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "action": "COURSE_CREATED",
      "resource_type": "courses",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "paymentStats": {
    "total": 450,
    "average": "277.77"
  }
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Rate Limiting

Current limits (subject to change):
- Authentication endpoints: 5 requests/minute
- General endpoints: 30 requests/minute
- Admin endpoints: 10 requests/minute

---

## Webhook Endpoints (Ready for Implementation)

- `POST /payments/webhook` - Paystack payment verification
- `POST /live-sessions/{id}/recording-callback` - Daily.co recording
- `POST /emails/bounce` - Resend bounce handling
