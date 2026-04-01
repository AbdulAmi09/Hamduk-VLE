"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { dbUtils } from "@/lib/db-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Plus, Trash2, Check, Clock } from "lucide-react"

interface Institution {
  id: string
  name: string
  website?: string
  status: "pending" | "active" | "inactive"
  joined_date?: string
  role?: string
}

export default function InstitutionsPage() {
  const { user } = useAuth()
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadInstitutions = async () => {
      try {
        const userInstitutions = await dbUtils.getUserInstitutions(user.id)
        setInstitutions(userInstitutions || [])
      } catch (error) {
        console.error("[v0] Failed to load institutions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadInstitutions()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading institutions...</p>
        </div>
      </div>
    )
  }

  const active = institutions.filter((i) => i.status === "active")
  const pending = institutions.filter((i) => i.status === "pending")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Affiliated Institutions</h1>
          <p className="text-muted-foreground mt-1">Manage your school and university affiliations</p>
        </div>

        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Institution
        </Button>
      </div>

      {/* Active Institutions */}
      {active.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Active ({active.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.map((institution) => (
              <Card key={institution.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Building2 className="h-6 w-6 text-primary mt-1" />
                      <div className="flex-1">
                        <CardTitle className="text-base">{institution.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {institution.role && `${institution.role} • `}
                          {institution.joined_date
                            ? `Joined ${new Date(institution.joined_date).toLocaleDateString()}`
                            : "No date"}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {institution.website && (
                  <CardContent>
                    <a
                      href={institution.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      {institution.website}
                    </a>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pending Institutions */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Pending ({pending.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pending.map((institution) => (
              <Card key={institution.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Building2 className="h-6 w-6 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <CardTitle className="text-base">{institution.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">Pending approval</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {active.length === 0 && pending.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground py-12">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No affiliated institutions</p>
            <p className="text-sm mt-2 mb-4">Add your school or university to get started</p>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Institution
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
