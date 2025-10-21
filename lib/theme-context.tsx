"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system")
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get saved theme from localStorage
    const saved = localStorage.getItem("theme") as Theme | null
    if (saved) {
      setThemeState(saved)
    }

    // Check system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    updateTheme(saved || "system", prefersDark)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        updateTheme("system", e.matches)
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  const updateTheme = (newTheme: Theme, prefersDark: boolean) => {
    const html = document.documentElement
    const shouldBeDark = newTheme === "dark" || (newTheme === "system" && prefersDark)

    if (shouldBeDark) {
      html.classList.add("dark")
      setIsDark(true)
    } else {
      html.classList.remove("dark")
      setIsDark(false)
    }
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("theme", newTheme)

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    updateTheme(newTheme, prefersDark)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {mounted ? children : <div suppressHydrationWarning>{children}</div>}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
