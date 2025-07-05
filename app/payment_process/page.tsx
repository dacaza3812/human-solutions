"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PaymentProcessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [status, setStatus] = useState<"loading" | "success" | "failure">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (sessionId) {
      const verifySession = async () => {
        try {
          const response = await fetch(`/api/stripe/session-success?session_id=${sessionId}`)
          const data = await response.json()

          if (response.ok && data.success) {
            setStatus("success")
            setMessage("¡Pago procesado con éxito! Tu suscripción está activa.")
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push("/dashboard")
            }, 3000)
          } else {
            setStatus("failure")
            setMessage(data.error || "Hubo un problema al procesar tu pago. Por favor, inténtalo de nuevo.")
          }
        } catch (error) {
          console.error("Error verifying session:", error)
          setStatus("failure")
          setMessage("Error de conexión. Por favor, verifica tu internet e inténtalo de nuevo.")
        }
      }
      verifySession()
    } else {
      setStatus("failure")
      setMessage("No se encontró el ID de sesión. Por favor, regresa a la página de planes.")
    }
  }, [sessionId, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6 text-center">
        <CardHeader>
          {status === "loading" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
              </div>
              <CardTitle className="text-2xl font-bold">Procesando tu pago...</CardTitle>
              <CardDescription>Por favor, no cierres esta ventana.</CardDescription>
            </>
          )}
          {status === "success" && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-emerald-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-emerald-500">¡Pago Exitoso!</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
          {status === "failure" && (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-500">Error en el Pago</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {status === "failure" && (
            <Button onClick={() => router.push("/planes")} className="mt-4 bg-emerald-500 hover:bg-emerald-600">
              Volver a Planes
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
