"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { dbUtils } from "@/lib/db-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Download, Share2, Calendar } from "lucide-react"

interface Certificate {
  id: string
  certificate_number: string
  issue_date: string
  class: {
    title: string
  }
  pdf_url?: string
}

export default function CertificatesPage() {
  const { user } = useAuth()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadCertificates = async () => {
      try {
        const certs = await dbUtils.getStudentCertificates(user.id)
        setCertificates(certs || [])
      } catch (error) {
        console.error("[v0] Failed to load certificates:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCertificates()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading certificates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Certificates</h1>
        <p className="text-muted-foreground mt-1">View and share your earned certificates</p>
      </div>

      {/* Certificates Grid */}
      {certificates.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground py-12">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No certificates yet</p>
            <p className="text-sm mt-2">Complete a course to earn your certificate</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <Card key={cert.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{cert.class.title}</CardTitle>
                    <CardDescription className="text-xs font-mono mt-1">
                      {cert.certificate_number}
                    </CardDescription>
                  </div>
                  <Award className="h-8 w-8 text-yellow-500" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Issued {new Date(cert.issue_date).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {cert.pdf_url && (
                    <Button variant="outline" size="sm" className="flex-1 gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  )}

                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>

                {/* Verification Link */}
                <div className="bg-muted p-2 rounded text-xs text-center text-muted-foreground truncate">
                  {`${window?.location?.origin || ""}/verify/${cert.certificate_number}`}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
