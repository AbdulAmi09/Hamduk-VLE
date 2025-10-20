"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Users, BarChart3, Settings, LogOut, Menu, X, FileText, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  userRole: "instructor" | "student" | "admin"
  userName: string
}

export function Sidebar({ userRole, userName }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)

  const instructorLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/courses", label: "My Courses", icon: BookOpen },
    { href: "/lectures", label: "Lectures", icon: FileText },
    { href: "/grades", label: "Grading", icon: BarChart3 },
    { href: "/students", label: "Students", icon: Users },
  ]

  const studentLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: '/courses", label: Enrolled Courses', icon: BookOpen },
    { href: "/lectures", label: "My Lectures", icon: FileText },
    { href: "/grades", label: "My Grades", icon: BarChart3 },
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
