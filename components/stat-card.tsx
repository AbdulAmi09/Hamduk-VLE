import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  trend?: { value: number; isPositive: boolean }
  color: "blue" | "green" | "orange" | "purple"
}

const colorClasses = {
  blue: "text-blue-600 bg-blue-50",
  green: "text-green-600 bg-green-50",
  orange: "text-orange-600 bg-orange-50",
  purple: "text-purple-600 bg-purple-50",
}

export function StatCard({ label, value, icon, trend, color }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 font-medium">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {trend && (
              <p className={`text-xs mt-2 ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
                {trend.isPositive ? "+" : ""}
                {trend.value}% from last month
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
