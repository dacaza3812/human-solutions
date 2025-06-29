"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"
import { useStripeCheckout } from "@/hooks/use-stripe-checkout"
import { toast } from "@/components/ui/use-toast"

interface SubscriptionInfo {
  id: string
  status: string
  current_period_end: string
  cancel_at_period_end: boolean
  plan_name: string
  price: number
  currency: string
}

interface Plan {
  id: string
  name: string
  price: number
  features: string[]
  stripePriceId: string
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Básico",
    price: 10,
    features: ["Acceso a funciones básicas", "Soporte por email", "10 casos/mes"],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD || "price_12345",
  },
  {
    id: "pro",
    name: "Pro",
    price: 25,
    features: ["Todas las funciones básicas", "Soporte prioritario", "Casos ilimitados", "Consultas con abogado"],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM || "price_67890",
  },
  {
    id: "enterprise",
    name: "Empresarial",
    price: 50,
    features: ["Todas las funciones Pro", "Gestor de cuenta dedicado", "Integraciones personalizadas"],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_COLLABORATIVE || "price_abcde",
  },
]

export default function SubscriptionsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { createCheckoutSession, loading: checkoutLoading } = useStripeCheckout()
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPlans, setShowPlans] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const fetchSubscriptionInfo = useCallback(async () => {
    if (!user || !profile || profile.account_type !== "client") {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*, prices(*, products(*))")
        .eq("user_id", user.id)
        .in("status", ["active", "trialing", "past_due", "canceled"]) // Include canceled to show options
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 means no rows found, which is fine (no subscription)
        console.error("Error fetching subscription:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la suscripción.",
          variant: "destructive",
        })
        setSubscriptionInfo(null)
        setShowPlans(true) // Show plans if there's an error fetching
      } else if (data) {
        const subscriptionStatus = data.status
        if (subscriptionStatus === "canceled") {
          setSubscriptionInfo(null) // Treat canceled as no active subscription for UI purposes
          setShowPlans(true) // Immediately show plans if canceled
        } else {
          setSubscriptionInfo({
            id: data.id,
            status: data.status,
            current_period_end: data.current_period_end,
            cancel_at_period_end: data.cancel_at_period_end,
            plan_name: data.prices?.products?.name || "Unknown Plan",
            price: data.prices?.unit_amount / 100 || 0,
            currency: data.prices?.currency || "usd",
          })
          setShowPlans(false)
        }
      } else {
        setSubscriptionInfo(null)
        setShowPlans(true) // Show plans if no subscription found
      }
    } catch (err) {
      console.error("Unexpected error fetching subscription:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado al cargar la suscripción.",
        variant: "destructive",
      })
      setSubscriptionInfo(null)
      setShowPlans(true)
    } finally {
      setLoading(false)
    }
  }, [user, profile])

  useEffect(() => {
    if (!authLoading) {
      fetchSubscriptionInfo()
    }
  }, [authLoading, fetchSubscriptionInfo])

  const handleManageSubscription = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.functions.invoke("create-portal-link", {
        body: { customer_id: profile?.stripe_customer_id },
      })

      if (error) {
        console.error("Error creating portal link:", error)
        toast({
          title: "Error",
          description: "No se pudo generar el enlace para gestionar la suscripción.",
          variant: "destructive",
        })
        return
      }

      if (data?.url) {
        window.location.href = data.url
      } else {
        toast({
          title: "Error",
          description: "No se recibió una URL válida para gestionar la suscripción.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Unexpected error managing subscription:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado al gestionar la suscripción.",
        variant: "destructive",
      })
    }
  }

  const handleCancelSubscription = async () => {
    if (!user || !subscriptionInfo) return

    setIsCancelling(true)
    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriptionId: subscriptionInfo.id }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Suscripción Cancelada",
          description: "Tu suscripción ha sido marcada para cancelación al final del período actual.",
        })
        fetchSubscriptionInfo() // Re-fetch to update UI
      } else {
        console.error("Error cancelling subscription:", result.error)
        toast({
          title: "Error al Cancelar",
          description: result.error || "No se pudo cancelar la suscripción.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Unexpected error during cancellation:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado al intentar cancelar la suscripción.",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (profile?.account_type !== "client") {
    return (
      <div className="text-center py-12">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-foreground mb-2">Acceso Denegado</h3>
        <p className="text-muted-foreground">Esta sección es solo para clientes.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Gestionar Suscripción</h1>

      {subscriptionInfo && !showPlans ? (
        <Card>
          <CardHeader>
            <CardTitle>Tu Suscripción Actual</CardTitle>
            <CardDescription>Detalles de tu plan actual.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              <span className="font-semibold">Plan:</span> {subscriptionInfo.plan_name}
            </p>
            <p>
              <span className="font-semibold">Precio:</span> ${subscriptionInfo.price.toFixed(2)} / mes
            </p>
            <p>
              <span className="font-semibold">Estado:</span>{" "}
              <span
                className={`capitalize ${subscriptionInfo.status === "active" ? "text-green-500" : "text-yellow-500"}`}
              >
                {subscriptionInfo.status}
              </span>
            </p>
            <p>
              <span className="font-semibold">Fin del Período Actual:</span>{" "}
              {new Date(subscriptionInfo.current_period_end).toLocaleDateString()}
            </p>
            {subscriptionInfo.cancel_at_period_end && (
              <p className="text-red-500">Tu suscripción se cancelará al final del período actual.</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleManageSubscription} disabled={checkoutLoading}>
              {checkoutLoading ? "Redirigiendo..." : "Gestionar en Stripe"}
            </Button>
            {!subscriptionInfo.cancel_at_period_end && (
              <Button variant="destructive" onClick={handleCancelSubscription} disabled={isCancelling}>
                {isCancelling ? "Cancelando..." : "Cancelar Suscripción"}
              </Button>
            )}
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  ${plan.price} <span className="text-muted-foreground">/ mes</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => createCheckoutSession(plan.stripePriceId)}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? "Cargando..." : "Seleccionar Plan"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
