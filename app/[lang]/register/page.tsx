"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/components/i18n-provider"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [accountType, setAccountType] = useState<"client" | "advisor">("client")
  const { signUp, loading } = useAuth()
  const router = useRouter()
  const { t } = useTranslations()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await signUp(email, password, fullName, accountType)
    if (!error) {
      // Redirect is handled inside signUp for now, but could be here
      // router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold">{t("common.register")}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t("auth.create_account")}</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">{t("auth.full_name")}</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
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
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountType">{t("auth.account_type")}</Label>
            <Select value={accountType} onValueChange={(value: "client" | "advisor") => setAccountType(value)}>
              <SelectTrigger id="accountType">
                <SelectValue placeholder={t("auth.select_account_type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">{t("auth.client")}</SelectItem>
                <SelectItem value="advisor">{t("auth.advisor")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? t("auth.registering") : t("common.register")}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {t("auth.already_have_account")}{" "}
          <Link className="font-medium text-blue-600 hover:underline dark:text-blue-500" href="/es/login">
            {t("common.login")}
          </Link>
        </div>
      </div>
    </div>
  )
}
