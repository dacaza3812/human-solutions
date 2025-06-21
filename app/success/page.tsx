"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionData, setSessionData] = useState<any>(null)

  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    if (!sessionId) {
      setError("No se encontró información de la sesión de pago")
      setLoading(false)
      return
    }

    // Verificar la sesión de pago
    const verifySession = async () => {
      try {
        const response = await fetch(`/api/verify-session?session_id=${sessionId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Error al verificar el pago")
        }

        setSessionData(data)
        setLoading(false)

        // Redirigir al dashboard después de 3 segundos
        setTimeout(() => {
          router.push("/dashboard")
        }, 3000)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al verificar el pago")
        setLoading(false)
      }
    }

    verifySession()
  }, [sessionId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Verificando tu pago...</h2>
            <p className="text-muted-foreground">Por favor espera mientras confirmamos tu suscripción.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error en el pago</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Ir al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <CardTitle className="text-2xl text-emerald-600">¡Pago Exitoso!</CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center space-y-4">
          <p className="text-lg font-medium">¡Bienvenido a Fox Lawyer!</p>
          <p className="text-muted-foreground">
            Tu suscripción al plan <span className="font-semibold">{sessionData?.planName}</span> ha sido activada
            exitosamente.
          </p>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Serás redirigido al dashboard en unos segundos...
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard")} className="w-full bg-emerald-500 hover:bg-emerald-600">
            Ir al Dashboard Ahora
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
