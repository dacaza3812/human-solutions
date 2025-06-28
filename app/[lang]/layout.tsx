import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { I18nProvider } from "@/components/i18n-provider"
import getRequestConfig from "@/lib/i18n" // Import the server-side i18n config

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FoxLawyer",
  description: "Your legal solutions partner.",
}

export default async function RootLayout({
  children,
  params: { lang },
}: Readonly<{
  children: React.ReactNode
  params: { lang: string }
}>) {
  let messages
  try {
    messages = (await getRequestConfig({ locale: lang })).messages
  } catch (error) {
    // Handle the case where the locale is not found
    console.error("Error loading messages for locale:", lang, error)
    // You might want to redirect to a default locale or show an error page
  }

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <I18nProvider locale={lang} messages={messages}>
            <AuthProvider>{children}</AuthProvider>
          </I18nProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
