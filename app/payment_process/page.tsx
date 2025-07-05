"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function PaymentProcessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get("session_id")
  const [status, setStatus] = useState("loading") // loading, success, error
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (sessionId) {
      const verifySession = async () => {
        try {
          const response = await fetch(`/api/stripe/session-success?session_id=${sessionId}`)
          const data = await response.json()

          if (response.ok) {
            setStatus("success")
            setMessage("¡Pago completado con éxito! Tu suscripción está activa.")
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push("/dashboard")
            }, 3000)
          } else {
            setStatus("error")
            setMessage(data.error || "Hubo un problema al verificar tu pago.")
          }
        } catch (err) {
          console.error("Error verifying session:", err)
          setStatus("error")
          setMessage("Error de conexión. Por favor, inténtalo de nuevo más tarde.")
        }
      }
      verifySession()
    } else {
      setStatus("error")
      setMessage("No se encontró el ID de sesión. Por favor, regresa a la página de planes.")
    }
  }, [sessionId, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          {status === "loading" && <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />}
          {status === "success" && <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />}
          {status === "error" && <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />}
          <CardTitle className="text-2xl font-bold">
            {status === "loading" && "Procesando Pago..."}
            {status === "success" && "¡Pago Exitoso!"}
            {status === "error" && "Error en el Pago"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant={status === "success" ? "default" : "destructive"}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
          {status === "error" && (
            <Button onClick={() => router.push("/planes")} className="w-full">
              Volver a Planes
            </Button>
          )}
          {status === "success" && (
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Ir al Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
