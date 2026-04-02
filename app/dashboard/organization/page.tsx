"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Users, BookOpen, Settings, Plus, MoreVertical, Edit, Trash2 } from "lucide-react"

interface Organization {
  id: string
  name: string
  website?: string
  description?: string
  member_count?: number
  class_count?: number
  created_at?: string
}

export default function OrganizationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const role = user.user_metadata?.role || "student"
    // Only tutors, instructors, and admins can manage organizations
    if (!["tutor", "instructor", "school_admin", "platform_admin"].includes(role)) {
      router.push("/dashboard")
      return
    }

    const loadOrganizations = async () => {
      try {
        const res = await fetch("/api/organizations")
        if (!res.ok) throw new Error("Failed to load organizations")
        const data = await res.json()
        setOrganizations(data.organizations || [])
        if (data.organizations?.length > 0) {
          setActiveOrgId(data.organizations[0].id)
        }
      } catch (error) {
        console.error("[v0] Failed to load organizations:", error)
      } finally {
        setLoading(false)
      }
    }

    loadOrganizations()
  }, [user, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading organizations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-muted-foreground mt-1">Manage schools and institutions</p>
        </div>

        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Organization
        </Button>
      </div>

      {/* Organizations Grid */}
      {organizations.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground py-12">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No organizations yet</p>
            <p className="text-sm mt-2">Create your first organization to get started</p>
            <Button className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Create Organization
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeOrgId || ""} onValueChange={setActiveOrgId} className="space-y-4">
          <TabsList className="grid w-full gap-2" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))` }}>
            {organizations.map((org) => (
              <TabsTrigger key={org.id} value={org.id} className="justify-start gap-2">
                <Building2 className="h-4 w-4" />
                {org.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {organizations.map((org) => (
            <TabsContent key={org.id} value={org.id} className="space-y-4">
              {/* Organization Header */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{org.name}</CardTitle>
                    {org.website && (
                      <CardDescription className="mt-2">
                        <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {org.website}
                        </a>
                      </CardDescription>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                {org.description && <CardContent>{org.description}</CardContent>}
              </Card>

              {/* Organization Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{org.member_count || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total members</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Classes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{org.class_count || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Active classes</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">Active</div>
                    <p className="text-xs text-muted-foreground mt-1">Organization status</p>
                  </CardContent>
                </Card>
              </div>

              {/* Management Tabs */}
              <Tabs defaultValue="members" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="members">Members</TabsTrigger>
                  <TabsTrigger value="classes">Classes</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="members">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Organization Members</CardTitle>
                          <CardDescription>Manage members and roles</CardDescription>
                        </div>
                        <Button size="sm" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add Member
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center text-muted-foreground py-8">No members yet</div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="classes">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Classes</CardTitle>
                          <CardDescription>Manage organization classes</CardDescription>
                        </div>
                        <Button size="sm" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Create Class
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center text-muted-foreground py-8">No classes yet</div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Organization Settings</CardTitle>
                      <CardDescription>Configure organization preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button variant="outline" className="w-full justify-start">
                        Edit Organization Details
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Manage Billing
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Security & Privacy
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
