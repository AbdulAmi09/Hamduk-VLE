"use client"

import { Bell, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 w-64">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-0 ml-2 text-sm focus:outline-none"
            />
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          <Button variant="ghost" size="icon">
            <User className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </div>
    </header>
  )
}
