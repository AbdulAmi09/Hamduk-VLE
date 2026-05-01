"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "./supabase-client"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, role: "student" | "instructor") => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const supabase = createClient()
      if (!supabase) {
        console.error("[v0] Supabase client not available")
        setLoading(false)
        return
      }

      supabase.auth
        .getSession()
        .then(({ data: { session } }: any) => {
          setUser(session?.user ?? null)
          setLoading(false)
        })
        .catch((err: any) => {
          console.error("[v0] Error getting session:", err)
          setLoading(false)
        })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        setUser(session?.user ?? null)
      })

      return () => subscription.unsubscribe()
    } catch (err) {
      console.error("[v0] Auth provider error:", err)
      setLoading(false)
    }
  }, [])

  const signUp = async (email: string, password: string, fullName: string, role: "student" | "instructor") => {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/auth/callback`,
      },
    })

    if (error) throw error

    // No need to manually insert - Supabase trigger handles it
    if (!data.user) {
      throw new Error("User creation failed")
    }
  }

  const signIn = async (email: string, password: string) => {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  const signOut = async () => {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/auth/reset-password`,
    })

    if (error) throw error
  }

  const updatePassword = async (newPassword: string) => {
    const supabase = createClient()
    if (!supabase) throw new Error("Supabase client not available")

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
