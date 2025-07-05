"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircleIcon, XCircleIcon, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PaymentProcessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Procesando tu pago...")

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId)
    } else {
      setStatus("error")
      setMessage("No se encontró el ID de sesión de pago.")
    }
  }, [sessionId])

  const verifyPayment = async (id: string) => {
    try {
      const response = await fetch(`/api/stripe/session-success?session_id=${id}`)
      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage("¡Pago procesado exitosamente! Redirigiendo a tu dashboard...")
        setTimeout(() => {
          router.push("/dashboard") // Redirect to dashboard on success
        }, 3000)
      } else {
        setStatus("error")
        setMessage(data.error || "Error al verificar el pago.")
      }
    } catch (error) {
      console.error("Error verifying payment:", error)
      setStatus("error")
      setMessage("Ocurrió un error inesperado al verificar el pago.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Estado del Pago</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          {status === "loading" && <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />}
          {status === "success" && <CheckCircleIcon className="h-12 w-12 text-green-500 mb-4" />}
          {status === "error" && <XCircleIcon className="h-12 w-12 text-red-500 mb-4" />}
          <p className="text-lg font-medium mb-4">{message}</p>
          {status === "error" && (
            <Link href="/dashboard/subscriptions">
              <Button>Volver a Suscripciones</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
