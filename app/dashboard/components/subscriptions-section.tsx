"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, XCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { loadStripe } from "@stripe/stripe-js"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Ensure Stripe is loaded once
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface SubscriptionInfo {
  status: string
  current_period_end: number // Changed to number to match Stripe timestamp
  cancel_at_period_end: boolean
  price_id: string
}

interface PricePlan {
  id: string
  name: string
  price: string
  features: string[]
  description: string
}

export function SubscriptionsSection() {
  const { user, profile, loading: authLoading } = useAuth()
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [showPlans, setShowPlans] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const pricePlans: PricePlan[] = [
    {
      id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD!,
      name: "Estándar",
      price: "$25/mes",
      features: ["Acceso a 5 asesores", "10 casos activos", "Soporte estándar"],
      description: "Ideal para usuarios individuales con necesidades moderadas.",
    },
    {
      id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM!,
      name: "Premium",
      price: "$50/mes",
      features: ["Acceso ilimitado a asesores", "Casos ilimitados", "Soporte prioritario", "Reportes avanzados"],
      description: "Para profesionales que requieren acceso completo y soporte premium.",
    },
    {
      id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_COLLABORATIVE!,
      name: "Colaborativo",
      price: "$100/mes",
      features: [
        "Todas las funciones Premium",
        "Gestión de equipos",
        "Integraciones personalizadas",
        "Asesor dedicado",
      ],
      description: "Solución completa para equipos y empresas.",
    },
  ]

  const fetchSubscriptionInfo = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { data, error: dbError } = await supabase
        .from("subscriptions")
        .select("status, current_period_end, cancel_at_period_end, price_id")
        .eq("user_id", user.id)
        .single()

      if (dbError && dbError.code !== "PGRST116") {
        // PGRST116 means no rows found
        throw dbError
      }

      if (data) {
        setSubscriptionInfo({
          status: data.status,
          current_period_end: data.current_period_end,
          cancel_at_period_end: data.cancel_at_period_end,
          price_id: data.price_id,
        })
        if (data.status === "canceled" || data.status === "incomplete_expired") {
          setShowPlans(true) // Show plans immediately if canceled or expired
        } else {
          setShowPlans(false)
        }
      } else {
        setSubscriptionInfo(null)
        setShowPlans(true) // No active subscription, show plans
      }
    } catch (err: any) {
      console.error("Error fetching subscription info:", err)
      setError("Error al cargar la información de la suscripción: " + err.message)
      setSubscriptionInfo(null)
      setShowPlans(true)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!authLoading && user) {
      fetchSubscriptionInfo()
    } else if (!authLoading && !user) {
      setLoading(false)
      setSubscriptionInfo(null)
      setShowPlans(true)
    }
  }, [authLoading, user, fetchSubscriptionInfo])

  const handleCheckout = async (priceId: string) => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId, userId: user?.id }),
      })

      const { sessionId, error: apiError } = await response.json()

      if (apiError) {
        throw new Error(apiError)
      }

      const stripe = await stripePromise
      if (!stripe) {
        throw new Error("Stripe.js no se cargó correctamente.")
      }

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId })

      if (stripeError) {
        throw stripeError
      }
    } catch (err: any) {
      console.error("Error during checkout:", err)
      setError("Error al iniciar el proceso de pago: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user?.id }),
      })

      const { success, error: apiError } = await response.json()

      if (apiError) {
        throw new Error(apiError)
      }

      if (success) {
        setSuccessMessage("Suscripción cancelada. Permanecerá activa hasta el final del período actual.")
        // Update local state to reflect cancellation at period end
        setSubscriptionInfo((prev) => (prev ? { ...prev, cancel_at_period_end: true, status: "active" } : null))
      } else {
        throw new Error("Fallo al cancelar la suscripción.")
      }
    } catch (err: any) {
      console.error("Error canceling subscription:", err)
      setError("Error al cancelar la suscripción: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-foreground mb-2">No Autenticado</h3>
        <p className="text-muted-foreground">Por favor, inicia sesión para ver tus suscripciones.</p>
      </div>
    )
  }

  const currentPlan = subscriptionInfo ? pricePlans.find((plan) => plan.id === subscriptionInfo.price_id) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Suscripciones</h2>
          <p className="text-muted-foreground">Gestiona tu plan de suscripción.</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {successMessage && (
        <Alert className="bg-green-100 border-green-400 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-400">
          <Check className="h-4 w-4" />
          <AlertTitle>Éxito</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {subscriptionInfo && !showPlans ? (
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Tu Suscripción Actual</CardTitle>
            <CardDescription>Estás suscrito al plan {currentPlan?.name || "Desconocido"}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-semibold">
              Estado:{" "}
              <span
                className={`font-bold ${subscriptionInfo.status === "active" ? "text-green-500" : "text-yellow-500"}`}
              >
                {subscriptionInfo.status === "active" ? "Activa" : "Inactiva"}
              </span>
            </p>
            <p>
              Período actual termina el: {new Date(subscriptionInfo.current_period_end * 1000).toLocaleDateString()}
            </p>
            {subscriptionInfo.cancel_at_period_end && (
              <p className="text-orange-500">Tu suscripción está marcada para cancelación al final del período.</p>
            )}
          </CardContent>
          <CardFooter>
            {!subscriptionInfo.cancel_at_period_end && (
              <Button onClick={handleCancelSubscription} disabled={loading} variant="destructive">
                {loading ? "Cancelando..." : "Cancelar Suscripción"}
              </Button>
            )}
            {/* Optionally add a button to resume subscription if canceled_at_period_end is true */}
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {pricePlans.map((plan) => (
            <Card key={plan.id} className="flex flex-col border-border/40">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="text-4xl font-bold text-foreground mb-4">{plan.price}</div>
                <ul className="space-y-2 text-muted-foreground text-center">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading}
                >
                  {loading ? "Cargando..." : "Seleccionar Plan"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
