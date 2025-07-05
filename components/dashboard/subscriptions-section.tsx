"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Info } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

interface Subscription {
  id: string
  status: string
  current_period_end: string
  cancel_at_period_end: boolean
  plan_id: number
}

interface Plan {
  id: number
  name: string
  price: string
  frequency: string
  features: string[]
}

const plans: Plan[] = [
  {
    id: 1,
    name: "Standard",
    price: "$49.99",
    frequency: "mensual",
    features: ["3 consultas/mes", "Soporte por email", "Acceso a recursos básicos", "Prioridad estándar"],
  },
  {
    id: 2,
    name: "Premium",
    price: "$149.99",
    frequency: "mensual",
    features: [
      "10 consultas/mes",
      "Soporte prioritario",
      "Acceso a todos los recursos",
      "Seguimiento personalizado",
      "Prioridad alta",
    ],
  },
  {
    id: 3,
    name: "Collaborative",
    price: "$299.99",
    frequency: "mensual",
    features: [
      "Consultas ilimitadas",
      "Asesor dedicado 24/7",
      "Acceso para equipos",
      "Reportes personalizados",
      "Prioridad empresarial",
    ],
  },
]

export function SubscriptionsSection() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    async function fetchSubscription() {
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase.from("user_subscriptions").select("*").eq("user_id", user.id).single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 means no rows found
        console.error("Error fetching subscription:", error)
        setError("Error al cargar la información de la suscripción.")
      } else if (data) {
        setSubscription(data)
      }
      setLoading(false)
    }

    fetchSubscription()
  }, [user, supabase])

  const handleCancelSubscription = async () => {
    if (!subscription?.stripe_subscription_id) return

    setActionLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriptionId: subscription.stripe_subscription_id }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Suscripción cancelada con éxito. Se mantendrá activa hasta el final del período actual.")
        setSubscription((prev) => (prev ? { ...prev, cancel_at_period_end: true } : null))
      } else {
        setError(data.error || "Error al cancelar la suscripción.")
      }
    } catch (err) {
      console.error("Error cancelling subscription:", err)
      setError("Error de conexión al cancelar la suscripción.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleManageSubscription = () => {
    // This would typically redirect to Stripe's customer portal
    // For now, we'll just log or show a message
    alert("Funcionalidad para gestionar suscripción (portal de clientes de Stripe) no implementada.")
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Suscripción</CardTitle>
          <CardDescription>Gestiona tu plan de suscripción.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  const currentPlan = subscription ? plans.find((p) => p.id === subscription.plan_id) : null

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Suscripción</CardTitle>
        <CardDescription>Gestiona tu plan de suscripción.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <AlertTitle>Éxito</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {!user ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No autenticado</AlertTitle>
            <AlertDescription>
              Por favor,{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/login")}>
                inicia sesión
              </Button>{" "}
              para ver y gestionar tu suscripción.
            </AlertDescription>
          </Alert>
        ) : !subscription ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Sin suscripción activa</AlertTitle>
            <AlertDescription>
              Actualmente no tienes una suscripción activa.{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/planes")}>
                Elige un plan
              </Button>{" "}
              para comenzar.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Plan Actual</p>
                <p className="text-2xl font-bold">{currentPlan?.name || "Desconocido"}</p>
                <p className="text-sm text-muted-foreground">
                  {currentPlan?.price} / {currentPlan?.frequency}
                </p>
              </div>
              <Button variant="outline" onClick={() => router.push("/planes")}>
                Cambiar Plan
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Estado de la Suscripción</p>
              <div className="flex items-center space-x-2">
                {subscription.status === "active" && <CheckCircle className="h-5 w-5 text-green-500" />}
                {subscription.status !== "active" && <XCircle className="h-5 w-5 text-red-500" />}
                <span className="text-lg font-semibold capitalize">{subscription.status}</span>
              </div>
              {subscription.current_period_end && (
                <p className="text-sm text-muted-foreground">
                  Período actual termina el: {format(new Date(subscription.current_period_end), "dd/MM/yyyy")}
                </p>
              )}
              {subscription.cancel_at_period_end && (
                <p className="text-sm text-orange-500 flex items-center">
                  <Info className="h-4 w-4 mr-1" />
                  Tu suscripción se cancelará al final del período actual.
                </p>
              )}
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              {!subscription.cancel_at_period_end && (
                <Button variant="destructive" onClick={handleCancelSubscription} disabled={actionLoading}>
                  {actionLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelando...
                    </>
                  ) : (
                    "Cancelar Suscripción"
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={handleManageSubscription} disabled={actionLoading}>
                Gestionar en Stripe
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
