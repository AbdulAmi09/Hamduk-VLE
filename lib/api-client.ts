export const apiClient = {
  async auth(action: string, data: any) {
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...data }),
    })
    return response.json()
  },

  async getCourses() {
    const response = await fetch("/api/courses")
    return response.json()
  },

  async createCourse(data: any) {
    const response = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async getLectures(courseId: string) {
    const response = await fetch(`/api/lectures?courseId=${courseId}`)
    return response.json()
  },

  async createLecture(data: any) {
    const response = await fetch("/api/lectures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async recordAttendance(data: any) {
    const response = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async getAttendance(lectureId: string) {
    const response = await fetch(`/api/attendance?lectureId=${lectureId}`)
    return response.json()
  },

  async getAssessments(courseId: string) {
    const response = await fetch(`/api/assessments?courseId=${courseId}`)
    return response.json()
  },

  async createAssessment(data: any) {
    const response = await fetch("/api/assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async submitGrade(data: any) {
    const response = await fetch("/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async getGrades(studentId: string) {
    const response = await fetch(`/api/grades?studentId=${studentId}`)
    return response.json()
  },

  async enrollStudent(data: any) {
    const response = await fetch("/api/enrollment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async getEnrollments(courseId: string) {
    const response = await fetch(`/api/enrollment?courseId=${courseId}`)
    return response.json()
  },
}
