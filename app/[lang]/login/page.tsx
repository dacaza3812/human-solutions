"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/components/i18n-provider"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { signIn, loading } = useAuth()
  const router = useRouter()
  const { t } = useTranslations()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await signIn(email, password)
    if (!error) {
      // Redirect is handled inside signIn for now, but could be here
      // router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold">{t("common.login")}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t("auth.enter_credentials")}</p>
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Link
                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
                href="/es/reset-password"
              >
                {t("auth.forgot_password")}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? t("auth.logging_in") : t("common.login")}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {t("auth.no_account")}{" "}
          <Link className="font-medium text-blue-600 hover:underline dark:text-blue-500" href="/es/register">
            {t("common.register")}
          </Link>
        </div>
      </div>
    </div>
  )
}
