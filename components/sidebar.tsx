"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Users, BarChart3, Settings, LogOut, Menu, X, FileText, Home, Award, Video, Building2, MessageSquare, Bell, CheckSquare, Clock, Sparkles, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  userRole: "instructor" | "student" | "admin"
  userName: string
}

export function Sidebar({ userRole, userName }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)

  const instructorLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/classes", label: "My Classes", icon: BookOpen },
    { href: "/dashboard/lessons", label: "Lessons", icon: FileText },
    { href: "/dashboard/assignments", label: "Assignments", icon: FileText },
    { href: "/dashboard/assessments", label: "Assessments", icon: CheckSquare },
    { href: "/dashboard/grades", label: "Grading", icon: BarChart3 },
    { href: "/dashboard/attendance", label: "Attendance", icon: Clock },
    { href: "/dashboard/live-sessions", label: "Live Sessions", icon: Video },
    { href: "/dashboard/announcements", label: "Announcements", icon: Bell },
    { href: "/dashboard/certificates", label: "Certificates", icon: Award },
    { href: "/dashboard/ai-tutor", label: "AI Tutor", icon: Sparkles },
    { href: "/dashboard/gamification", label: "Gamification", icon: Trophy },
    { href: "/dashboard/organization", label: "Organization", icon: Building2 },
    { href: "/dashboard/profile", label: "Profile", icon: Users },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ]

  const studentLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/classes", label: "Classes", icon: BookOpen },
    { href: "/dashboard/lessons", label: "Lessons", icon: FileText },
    { href: "/dashboard/assessments", label: "Assessments", icon: CheckSquare },
    { href: "/dashboard/assignments", label: "Assignments", icon: FileText },
    { href: "/dashboard/live-sessions", label: "Live Sessions", icon: Video },
    { href: "/dashboard/grades", label: "Grades", icon: BarChart3 },
    { href: "/dashboard/certificates", label: "Certificates", icon: Award },
    { href: "/dashboard/attendance", label: "Attendance", icon: Clock },
    { href: "/dashboard/announcements", label: "Announcements", icon: Bell },
    { href: "/dashboard/discussions", label: "Discussions", icon: MessageSquare },
    { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
    { href: "/dashboard/ai-tutor", label: "AI Tutor", icon: Sparkles },
    { href: "/dashboard/gamification", label: "Gamification", icon: Trophy },
    { href: "/dashboard/institutions", label: "Institutions", icon: Building2 },
    { href: "/dashboard/profile", label: "Profile", icon: Users },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ]

  const adminLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/institutions", label: "Institutions", icon: Users },
    { href: "/users", label: "Users", icon: Users },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  const links = userRole === "instructor" ? instructorLinks : userRole === "admin" ? adminLinks : studentLinks

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
          isOpen ? "w-64" : "w-0 md:w-64"
        } overflow-hidden`}
      >
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600">Hamduk</h1>
          <p className="text-xs text-gray-600 mt-1">Virtual Learning Environment</p>
        </div>

        <nav className="p-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 space-y-2">
          <div className="px-4 py-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Logged in as</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-500 capitalize">{userRole}</p>
          </div>
          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 bg-transparent">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Offset */}
      <div className={`transition-all duration-300 ${isOpen ? "md:ml-64" : ""}`} />
    </>
  )
}
