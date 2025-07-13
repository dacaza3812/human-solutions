"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { sendPaymentSuccessEmail } from "@/actions/sendPaymentEmail"

export default function PaymentProcess() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [countdown, setCountdown] = useState(5)
  const [paymentVerified, setPaymentVerified] = useState(false) // Estado para evitar múltiples verificaciones
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile, loading } = useAuth() // Incluye el estado de carga del contexto de autenticación

  const success = searchParams.get("success")
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    // Espera a que el estado de autenticación esté completamente cargado
    if (loading) return

    if (!user) {
      router.push("/login")
      return
    }

    // Verifica el pago solo si no ha sido verificado previamente
    if (success === "true" && sessionId && !paymentVerified) {
      verifyPayment(sessionId)
    } else if (!sessionId || success !== "true") {
      setStatus("error")
      setMessage("No se encontraron parámetros de pago válidos.")
    }
  }, [success, sessionId, user, paymentVerified, loading]) // Agrega `loading` como dependencia

  useEffect(() => {
    if (status === "success" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (status === "success" && countdown === 0) {
      router.push("/dashboard/subscriptions")
    }
  }, [status, countdown, router])

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch("/api/stripe/session-success", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Envía el correo solo si el pago es exitoso
        await sendPaymentSuccessEmail(user?.email, profile?.first_name, data.planName)

        setStatus("success")
        setMessage("¡Pago exitoso! Tu suscripción ha sido activada correctamente.")
        setPaymentVerified(true) // Marca el pago como verificado
      } else {
        setStatus("error")
        setMessage(data.error || "Error al verificar el pago.")
      }
    } catch (error) {
      console.error("Error verifying payment:", error)
      setStatus("error")
      setMessage("Error de conexión al verificar el pago.")
    }
  }

  const handleGoToDashboard = () => {
    router.push("/dashboard/subscriptions")
  }

  const handleGoHome = () => {
    router.push("/dashboard/subscriptions")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />}
            {status === "success" && <CheckCircle className="w-16 h-16 text-emerald-500" />}
            {status === "error" && <XCircle className="w-16 h-16 text-red-500" />}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Procesando Pago..."}
            {status === "success" && "¡Pago Exitoso!"}
            {status === "error" && "Error en el Pago"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>

          {status === "success" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Serás redirigido al dashboard en {countdown} segundos...</p>
              <Button onClick={handleGoToDashboard} className="w-full bg-emerald-500 hover:bg-emerald-600">
                Ir al Dashboard Ahora
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-2">
              <Button onClick={handleGoHome} variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Button>
              <Button onClick={handleGoToDashboard} className="w-full bg-emerald-500 hover:bg-emerald-600">
                Ir al Dashboard
              </Button>
            </div>
          )}

          {status === "loading" && (
            <p className="text-sm text-muted-foreground">Por favor espera mientras verificamos tu pago...</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}