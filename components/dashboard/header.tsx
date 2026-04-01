"use client"

import { useTheme } from "@/lib/theme-context"
import { Bell, Moon, Sun, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface HeaderProps {
  title?: string
  subtitle?: string
}

export function Header({ title = "Dashboard", subtitle }: HeaderProps) {
  const { theme, setTheme, isDark } = useTheme()

  const toggleTheme = () => {
    const themes: Array<"light" | "dark" | "system"> = ["light", "dark", "system"]
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <Badge className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs">
              3
            </Badge>
          </Button>

          {/* Theme Toggle */}
          <Button onClick={toggleTheme} variant="ghost" size="icon">
            {isDark ? (
              <Sun className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Moon className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>

          {/* Profile */}
          <Link href="/dashboard/profile">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5 text-muted-foreground" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
