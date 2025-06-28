"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircleIcon, XCircleIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTranslations } from "@/components/i18n-provider"

export default function PaymentProcessPage({ params: { lang } }: { params: { lang: string } }) {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [status, setStatus] = useState("loading") // loading, success, error
  const { t } = useTranslations()

  useEffect(() => {
    if (sessionId) {
      // In a real application, you would verify the session ID on your backend
      // For this example, we'll just simulate success
      setTimeout(() => {
        setStatus("success")
      }, 1500)
    } else {
      setStatus("error")
    }
  }, [sessionId])

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {status === "loading" && t("common.loading")}
            {status === "success" && t("payment.success_title")}
            {status === "error" && t("payment.error_title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center space-y-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <p className="text-gray-500 dark:text-gray-400">{t("payment.processing_payment")}</p>
            </div>
          )}
          {status === "success" && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircleIcon className="h-16 w-16 text-green-500" />
              <p className="text-lg font-medium text-gray-900 dark:text-gray-50">{t("payment.success_message")}</p>
              <Button asChild>
                <Link href={`/${lang}/dashboard`}>{t("common.dashboard")}</Link>
              </Button>
            </div>
          )}
          {status === "error" && (
            <div className="flex flex-col items-center space-y-4">
              <XCircleIcon className="h-16 w-16 text-red-500" />
              <p className="text-lg font-medium text-gray-900 dark:text-gray-50">{t("payment.error_message")}</p>
              <Button asChild variant="outline">
                <Link href={`/${lang}/dashboard`}>{t("payment.try_again")}</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
