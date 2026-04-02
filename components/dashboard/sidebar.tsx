"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  LogOut,
  MessageSquare,
  Trophy,
  Clock,
  FileText,
  Zap,
  Award,
  GraduationCap,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface SidebarProps {
  userRole: string
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/")

  const getMenuItems = () => {
    const commonItems = [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
      { href: "/dashboard/profile", label: "Profile", icon: Users },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ]

    const studentItems = [
      { href: "/dashboard/classes", label: "My Classes", icon: BookOpen },
      { href: "/dashboard/assignments", label: "Assignments", icon: FileText },
      { href: "/dashboard/grades", label: "Grades", icon: BarChart3 },
      { href: "/dashboard/certificates", label: "Certificates", icon: GraduationCap },
    ]

    const tutorItems = [
      { href: "/dashboard/classes", label: "My Classes", icon: BookOpen },
      { href: "/dashboard/students", label: "Students", icon: Users },
      { href: "/dashboard/submissions", label: "Submissions", icon: FileText },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/live-sessions", label: "Live Sessions", icon: Clock },
    ]

    const adminItems = [
      { href: "/dashboard/institution", label: "Institution", icon: GraduationCap },
      { href: "/dashboard/staff", label: "Staff", icon: Users },
      { href: "/dashboard/students", label: "Students", icon: Users },
      { href: "/dashboard/classes", label: "Classes", icon: BookOpen },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/billing", label: "Billing", icon: FileText },
    ]

    const platformAdminItems = [
      { href: "/dashboard/schools", label: "Schools", icon: GraduationCap },
      { href: "/dashboard/users", label: "Users", icon: Users },
      { href: "/dashboard/analytics", label: "Platform Analytics", icon: BarChart3 },
      { href: "/dashboard/feature-flags", label: "Feature Flags", icon: Zap },
      { href: "/dashboard/audit-logs", label: "Audit Logs", icon: FileText },
    ]

    let items = commonItems

    if (userRole === "student") {
      items.push(...studentItems)
    } else if (userRole === "tutor" || userRole === "instructor") {
      items.push(...tutorItems)
    } else if (userRole === "school_admin") {
      items.push(...adminItems)
    } else if (userRole === "platform_admin") {
      items.push(...platformAdminItems)
    }

    return items
  }

  const menuItems = getMenuItems()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card p-4 text-sm shadow-sm">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold">
          H
        </div>
        <span className="text-lg font-bold text-foreground">Hamduk VLE</span>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="my-6 border-t border-border"></div>

      {/* Logout */}
      <Button
        onClick={async () => {
          await signOut()
        }}
        variant="ghost"
        className="w-full justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </Button>
    </aside>
  )
}
