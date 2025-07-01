"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PaymentProcessPage() {
  const searchParams = useSearchParams()
  const status = searchParams.get("status")
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (status === "success") {
      setMessage("¡Tu suscripción ha sido activada exitosamente!")
      setIsSuccess(true)
    } else if (status === "cancelled") {
      setMessage("El proceso de suscripción ha sido cancelado.")
      setIsSuccess(false)
    } else if (status === "error") {
      setMessage("Hubo un error al procesar tu suscripción. Por favor, inténtalo de nuevo.")
      setIsSuccess(false)
    } else if (status === "pending") {
      setMessage("Tu suscripción está pendiente de confirmación. Por favor, revisa tu correo electrónico.")
      setIsSuccess(false) // Or a neutral state
    } else {
      setMessage("Estado de la transacción desconocido.")
      setIsSuccess(false)
    }
  }, [status])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-1">
          {isSuccess ? (
            <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
          ) : (
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
          )}
          <CardTitle className="text-2xl font-bold">{isSuccess ? "¡Pago Exitoso!" : "Proceso Incompleto"}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/dashboard/subscriptions">
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600">Ir a Mis Suscripciones</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="w-full bg-transparent">
              Volver al Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
