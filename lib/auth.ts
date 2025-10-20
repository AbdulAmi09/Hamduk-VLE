// Authentication utilities
import crypto from "crypto"

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

export interface User {
  id: string
  email: string
  full_name: string
  role: "admin" | "instructor" | "student"
  institution_id?: string
  avatar_url?: string
}

export interface AuthSession {
  user: User
  token: string
  expiresAt: number
}

// Mock session storage (replace with actual session management)
const sessions = new Map<string, AuthSession>()

export function createSession(user: User): AuthSession {
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  const session: AuthSession = { user, token, expiresAt }
  sessions.set(token, session)
  return session
}

export function getSession(token: string): AuthSession | null {
  const session = sessions.get(token)
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token)
    return null
  }
  return session
}
