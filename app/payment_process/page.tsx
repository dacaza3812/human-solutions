"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PaymentProcessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "failure">("loading")
  const [message, setMessage] = useState("Procesando tu pago...")

  useEffect(() => {
    const success = searchParams.get("success")
    const canceled = searchParams.get("canceled")

    if (success === "true") {
      setStatus("success")
      setMessage("¡Tu suscripción ha sido activada con éxito!")
    } else if (canceled === "true") {
      setStatus("failure")
      setMessage("El proceso de pago fue cancelado. Puedes intentarlo de nuevo.")
    } else {
      // This case should ideally be handled by the API route redirecting
      // If a user lands here without params, it's an unexpected state.
      setStatus("failure")
      setMessage("Hubo un problema con el proceso de pago. Por favor, inténtalo de nuevo.")
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          {status === "loading" && <Loader2 className="mx-auto h-12 w-12 animate-spin text-emerald-500" />}
          {status === "success" && <CheckCircle className="mx-auto h-12 w-12 text-green-500" />}
          {status === "failure" && <XCircle className="mx-auto h-12 w-12 text-red-500" />}
          <CardTitle className="mt-4 text-2xl">
            {status === "loading" && "Procesando..."}
            {status === "success" && "¡Pago Exitoso!"}
            {status === "failure" && "Error en el Pago"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" && (
            <Link href="/dashboard">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600">Ir al Dashboard</Button>
            </Link>
          )}
          {status === "failure" && (
            <Link href="/dashboard/subscriptions">
              <Button className="w-full bg-red-500 hover:bg-red-600">Reintentar Suscripción</Button>
            </Link>
          )}
          {status === "loading" && (
            <Button className="w-full bg-emerald-500" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando...
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
