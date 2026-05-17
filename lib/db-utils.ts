import { createClient } from "./supabase-client"

/**
 * Database utility functions for common operations
 * Provides type-safe query builders and helpers
 */

export const dbUtils = {
  // User operations
  async getUserById(userId: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) throw error
    return data
  },

  async getUserByEmail(email: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error && error.code !== "PGRST116") throw error
    return data || null
  },

  async createUserProfile(userId: string, email: string, fullName: string, role: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("users")
      .insert({
        id: userId,
        email,
        full_name: fullName,
        role,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Class operations
  async getClassById(classId: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("classes")
      .select(
        `
        *,
        created_by_user:created_by(full_name, email),
        institution:institutions(name),
        modules(id, title, lessons(id, title))
      `,
      )
      .eq("id", classId)
      .single()

    if (error) throw error
    return data
  },

  async getUserClasses(userId: string, role: "student" | "tutor" | "admin" | "super_admin") {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    if (role === "student") {
      // Get enrollments first, then fetch classes
      const { data: enrollments, error: enrollError } = await supabase
        .from("class_enrollments")
        .select("class_id")
        .eq("student_id", userId)

      if (enrollError) throw enrollError

      const classIds = enrollments?.map((e: any) => e.class_id) || []
      if (classIds.length === 0) return []

      const { data, error } = await supabase
        .from("classes")
        .select(
          `
          *,
          created_by_user:created_by(full_name),
          modules(count)
        `,
        )
        .in("id", classIds)

      if (error) throw error
      return data || []
    } else if (role === "tutor" || role === "admin") {
      const { data, error } = await supabase
        .from("classes")
        .select(
          `
          *,
          created_by_user:created_by(full_name),
          modules(count)
        `,
        )
        .eq("created_by", userId)

      if (error) throw error
      return data || []
    } else {
      // super_admin sees all
      const { data, error } = await supabase
        .from("classes")
        .select(
          `
          *,
          created_by_user:created_by(full_name),
          modules(count)
        `,
        )

      if (error) throw error
      return data || []
    }
  },

  async createClass(classData: {
    institution_id?: string
    created_by: string
    title: string
    description?: string
    category?: string
    start_date?: string
    end_date?: string
  }) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("classes")
      .insert(classData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Enrollment operations
  async enrollStudent(classId: string, studentId: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("class_enrollments")
      .insert({
        class_id: classId,
        student_id: studentId,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getClassEnrollments(classId: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("class_enrollments")
      .select("*, student:student_id(full_name, email)")
      .eq("class_id", classId)

    if (error) throw error
    return data || []
  },

  // Lesson operations
  async getLessonsByModule(moduleId: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("module_id", moduleId)
      .order("order_index", { ascending: true })

    if (error) throw error
    return data || []
  },

  async getLessonProgress(lessonId: string, studentId: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("lesson_id", lessonId)
      .eq("student_id", studentId)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data || null
  },

  async updateLessonProgress(lessonId: string, studentId: string, watchPercentage: number) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const isCompleted = watchPercentage >= 75

    const { data, error } = await supabase
      .from("lesson_progress")
      .upsert({
        lesson_id: lessonId,
        student_id: studentId,
        watch_percentage: watchPercentage,
        is_completed: isCompleted,
        last_watched_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Assignment operations
  async getAssignmentsByClass(classId: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("assignments")
      .select("*, created_by_user:created_by(full_name)")
      .eq("class_id", classId)
      .order("due_date", { ascending: true })

    if (error) throw error
    return data || []
  },

  async submitAssignment(assignmentId: string, studentId: string, submissionData: any) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("assignment_submissions")
      .upsert({
        assignment_id: assignmentId,
        student_id: studentId,
        ...submissionData,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Grade operations
  async getClassGrades(classId: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("grades")
      .select("*, student:student_id(full_name, email)")
      .eq("class_id", classId)

    if (error) throw error
    return data || []
  },

  async getStudentGrades(studentId: string, classId: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("grades")
      .select("*")
      .eq("student_id", studentId)
      .eq("class_id", classId)

    if (error) throw error
    return data || []
  },

  // Notification operations
  async getUserNotifications(userId: string, limit = 20) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  async createNotification(userId: string, notificationData: any) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        ...notificationData,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async markNotificationAsRead(notificationId: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", notificationId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Live session operations
  async getLiveSessionsByClass(classId: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("live_sessions")
      .select("*, created_by_user:created_by(full_name)")
      .eq("class_id", classId)
      .order("session_date", { ascending: false })

    if (error) throw error
    return data || []
  },

  async createLiveSession(sessionData: any) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("live_sessions")
      .insert(sessionData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Gamification operations
  async getGameificationStats(userId: string, classId: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("gamification_stats")
      .select("*")
      .eq("user_id", userId)
      .eq("class_id", classId)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data || null
  },

  async addXP(userId: string, classId: string, amount: number, reason: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    // Record XP transaction
    const { error: txError } = await supabase.from("xp_transactions").insert({
      user_id: userId,
      class_id: classId,
      xp_amount: amount,
      reason,
    })

    if (txError) throw txError

    // Update gamification stats
    const stats = await this.getGameificationStats(userId, classId)

    if (stats) {
      const { error: updateError } = await supabase
        .from("gamification_stats")
        .update({
          total_xp: stats.total_xp + amount,
          level: Math.floor((stats.total_xp + amount) / 1000) + 1,
        })
        .eq("user_id", userId)
        .eq("class_id", classId)

      if (updateError) throw updateError
    } else {
      const { error: insertError } = await supabase.from("gamification_stats").insert({
        user_id: userId,
        class_id: classId,
        total_xp: amount,
        level: 1,
      })

      if (insertError) throw insertError
    }
  },

  // Attendance operations
  async recordAttendance(classId: string, studentId: string, isPresent: boolean) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("attendance")
      .insert({
        class_id: classId,
        student_id: studentId,
        date: new Date().toISOString(),
        is_present: isPresent,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getAttendanceStats(classId: string, studentId: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error, count } = await supabase
      .from("attendance")
      .select("is_present", { count: "exact" })
      .eq("class_id", classId)
      .eq("student_id", studentId)

    if (error) throw error

    const presentCount = data?.filter((a: any) => a.is_present).length || 0
    const totalCount = count || 0
    const percentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0

    return {
      total: totalCount,
      present: presentCount,
      percentage: Math.round(percentage),
    }
  },

  // Institution operations
  async getInstitutionById(institutionId: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("institutions")
      .select("*")
      .eq("id", institutionId)
      .single()

    if (error) throw error
    return data
  },

  async getInstitutionMembers(institutionId: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("institution_members")
      .select("*, user:user_id(full_name, email, role)")
      .eq("institution_id", institutionId)

    if (error) throw error
    return data || []
  },

  // Announcement operations
  async getClassAnnouncements(classId: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("announcements")
      .select("*, created_by_user:created_by(full_name)")
      .eq("class_id", classId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  // Discussion operations
  async getDiscussions(lessonId: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("discussion_threads")
      .select("*, created_by_user:created_by(full_name), replies:discussion_replies(count)")
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  // Direct message operations
  async getConversation(userId: string, otherUserId: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("direct_messages")
      .select("*")
      .or(
        `and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`,
      )
      .order("created_at", { ascending: true })

    if (error) throw error
    return data || []
  },

  async sendDirectMessage(senderId: string, recipientId: string, messageText: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("direct_messages")
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        message_text: messageText,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Certificate operations
  async generateCertificate(studentId: string, classId: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const { data, error } = await supabase
      .from("certificates")
      .insert({
        student_id: studentId,
        class_id: classId,
        certificate_number: certificateNumber,
        issue_date: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getStudentCertificates(studentId: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("certificates")
      .select("*, class:class_id(title)")
      .eq("student_id", studentId)

    if (error) throw error
    return data || []
  },

  async getUserInstitutions(userId: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("user_institutions")
      .select("*, institution:institution_id(name, website)")
      .eq("user_id", userId)

    if (error) throw error
    return data || []
  },

  async getClassStudents(classId: string) {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase
      .from("class_enrollments")
      .select("student_id")
      .eq("class_id", classId)

    if (error) throw error
    return data?.map((e: any) => ({ id: e.student_id })) || []
  },
}
