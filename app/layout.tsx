import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/lib/theme-context"

import { Geist, Geist_Mono, Source_Serif_4 } from 'next/font/google'

// Initialize fonts
const geist = Geist({ subsets: ["latin"], weight: ["100","200","300","400","500","600","700","800","900"] })
const geistMono = Geist_Mono({ subsets: ["latin"], weight: ["100","200","300","400","500","600","700","800","900"] })
const sourceSerif4 = Source_Serif_4({ subsets: ["latin"], weight: ["200","300","400","500","600","700","800","900"] })

export const metadata: Metadata = {
  title: "Hamduk VLE - Virtual Learning Environment",
  description: "Modern virtual learning platform for educational institutions",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
