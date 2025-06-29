"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2, FileText } from "lucide-react"
import { useStripeCheckout } from "@/hooks/use-stripe-checkout"
import { cn } from "@/lib/utils"

interface SubscriptionInfo {
  status: string
  current_period_end?: string
  cancel_at_period_end?: boolean
  plan_name?: string
  price_id?: string
}

interface Price {
  id: string
  name: string
  description: string
  price: string
  features: string[]
  isRecommended?: boolean
}

export default function SubscriptionsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(true)
  const [showPlans, setShowPlans] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const { createCheckoutSession, loading: checkoutLoading } = useStripeCheckout()

  const prices: Price[] = [
    {
      id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD || "price_12345",
      name: "Estándar",
      description: "Ideal para usuarios individuales.",
      price: "$10/mes",
      features: ["Acceso a funciones básicas", "Soporte por email", "5 casos activos", "20 mensajes al mes"],
    },
    {
      id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM || "price_67890",
      name: "Premium",
      description: "Para profesionales que necesitan más.",
      price: "$25/mes",
      features: [
        "Todas las funciones Estándar",
        "Soporte prioritario",
        "Casos ilimitados",
        "Mensajes ilimitados",
        "Análisis avanzados",
      ],
      isRecommended: true,
    },
    {
      id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_COLLABORATIVE || "price_abcde",
      name: "Colaborativo",
      description: "Para equipos y despachos.",
      price: "$50/mes",
      features: [
        "Todas las funciones Premium",
        "Gestión de múltiples usuarios",
        "Roles y permisos",
        "Integraciones",
        "Soporte 24/7",
      ],
    },
  ]

  const fetchSubscriptionInfo = useCallback(async () => {
    if (!user) {
      setLoadingSubscription(false)
      setSubscriptionInfo(null)
      setShowPlans(true) // Show plans if no user
      return
    }

    setLoadingSubscription(true)
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("status, current_period_end, cancel_at_period_end, prices(id, products(name))")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error) {
        console.error("Error fetching subscription:", error)
        setSubscriptionInfo(null)
        setShowPlans(true) // Show plans on error
        return
      }

      if (data) {
        const status = data.status
        const planName = (data.prices?.products as { name: string })?.name || "Desconocido"
        const priceId = data.prices?.id || ""

        setSubscriptionInfo({
          status: status,
          current_period_end: data.current_period_end || undefined,
          cancel_at_period_end: data.cancel_at_period_end || false,
          plan_name: planName,
          price_id: priceId,
        })

        // If subscription is active or trialing, hide plans. If canceled, show plans.
        if (status === "active" || status === "trialing") {
          setShowPlans(false)
        } else if (status === "canceled" || status === "incomplete" || status === "unpaid") {
          setShowPlans(true)
        }
      } else {
        setSubscriptionInfo(null)
        setShowPlans(true) // No subscription found, show plans
      }
    } catch (err) {
      console.error("Unexpected error fetching subscription:", err)
      setSubscriptionInfo(null)
      setShowPlans(true) // Show plans on unexpected error
    } finally {
      setLoadingSubscription(false)
    }
  }, [user])

  useEffect(() => {
    if (!authLoading) {
      fetchSubscriptionInfo()
    }
  }, [authLoading, fetchSubscriptionInfo])

  const handleCancelSubscription = async () => {
    if (!user) return

    setIsCancelling(true)
    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const result = await response.json()

      if (response.ok) {
        console.log("Subscription cancellation initiated:", result)
        // Re-fetch subscription info to update UI
        await fetchSubscriptionInfo()
      } else {
        console.error("Failed to cancel subscription:", result.error)
        alert(`Error al cancelar la suscripción: ${result.error}`)
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error)
      alert("Ocurrió un error inesperado al cancelar la suscripción.")
    } finally {
      setIsCancelling(false)
    }
  }

  if (authLoading || loadingSubscription) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Cargando...</h3>
        <p className="text-muted-foreground">Cargando información de suscripción.</p>
      </div>
    )
  }

  if (profile?.account_type !== "client") {
    return (
      <div className="text-center py-12">
        <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-foreground mb-2">Acceso Denegado</h3>
        <p className="text-muted-foreground">Solo los usuarios con cuenta de cliente pueden acceder a esta sección.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Gestión de Suscripciones</h2>
          <p className="text-muted-foreground">Gestiona tu plan de suscripción y beneficios.</p>
        </div>
      </div>

      {!showPlans && subscriptionInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Tu Suscripción Actual</CardTitle>
            <CardDescription>Detalles de tu plan activo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              <span className="font-semibold">Plan:</span> {subscriptionInfo.plan_name}
            </p>
            <p>
              <span className="font-semibold">Estado:</span>{" "}
              <span
                className={cn(
                  "font-medium",
                  subscriptionInfo.status === "active" && "text-green-600",
                  subscriptionInfo.status === "trialing" && "text-blue-600",
                  subscriptionInfo.status === "canceled" && "text-red-600",
                )}
              >
                {subscriptionInfo.status === "active"
                  ? "Activa"
                  : subscriptionInfo.status === "trialing"
                    ? "En Prueba"
                    : subscriptionInfo.status === "canceled"
                      ? "Cancelada"
                      : subscriptionInfo.status}
              </span>
            </p>
            {subscriptionInfo.current_period_end && (
              <p>
                <span className="font-semibold">Fin del Período Actual:</span>{" "}
                {new Date(subscriptionInfo.current_period_end).toLocaleDateString()}
              </p>
            )}
            {subscriptionInfo.cancel_at_period_end && (
              <p className="text-orange-500 font-medium">Tu suscripción se cancelará al final del período actual.</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            {!subscriptionInfo.cancel_at_period_end && (
              <Button onClick={handleCancelSubscription} disabled={isCancelling}>
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cancelando...
                  </>
                ) : (
                  "Cancelar Suscripción"
                )}
              </Button>
            )}
            {subscriptionInfo.cancel_at_period_end && (
              <Button variant="outline" onClick={() => setShowPlans(true)}>
                Cambiar Plan
              </Button>
            )}
          </CardFooter>
        </Card>
      )}

      {showPlans && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {prices.map((price) => (
            <Card
              key={price.id}
              className={cn("flex flex-col", price.isRecommended && "border-primary ring-2 ring-primary")}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {price.name}
                  {price.isRecommended && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                      Recomendado
                    </span>
                  )}
                </CardTitle>
                <CardDescription>{price.description}</CardDescription>
                <p className="text-3xl font-bold">{price.price}</p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {price.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => createCheckoutSession(price.id)}
                  disabled={checkoutLoading || subscriptionInfo?.price_id === price.id}
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...
                    </>
                  ) : subscriptionInfo?.price_id === price.id ? (
                    "Plan Actual"
                  ) : (
                    "Seleccionar Plan"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
