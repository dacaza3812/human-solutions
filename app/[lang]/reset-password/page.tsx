"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useTranslations } from "@/components/i18n-provider"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const { resetPassword, loading } = useAuth()
  const { t } = useTranslations()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await resetPassword(email)
    if (!error) {
      // Handle success, e.g., show a message
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold">{t("auth.reset_password")}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t("auth.enter_email_reset")}</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? t("auth.sending_reset_link") : t("auth.send_reset_link")}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link className="font-medium text-blue-600 hover:underline dark:text-blue-500" href="/es/login">
            {t("auth.back_to_login")}
          </Link>
        </div>
      </div>
    </div>
  )
}
