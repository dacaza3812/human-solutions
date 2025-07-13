import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
//import { Suspense } from "react" // Corrected import: Suspense comes from 'react'
import "./globals.css"

export const metadata: Metadata = {
  title: "Fox Lawyer - Asesoría Legal Personalizada",
  description: "Asesoría legal personalizada para resolver problemas financieros, familiares y amorosos",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange={false}>
          <AuthProvider>
            {/* render directo, sin Suspense en el root */}
            {children}
            <SpeedInsights />
            <Analytics />
          </AuthProvider>

        </ThemeProvider>
      </body>
    </html>
  )
}
