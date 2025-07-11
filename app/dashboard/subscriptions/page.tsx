"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useStripeCheckout } from "@/hooks/use-stripe-checkout"
import { toast } from "@/components/ui/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

interface Plan {
  id: string
  name: string
  price: string
  features: string[]
  stripePriceId: string
}

export default function SubscriptionsPage() {
  const { user, profile, isLoading: isProfileLoading } = useAuth()
  const { createCheckoutSession, isLoading: isCheckoutLoading } = useStripeCheckout()
  const [isCanceling, setIsCanceling] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const success = searchParams.get("success")
    const canceled = searchParams.get("canceled")
    const error = searchParams.get("error")

    if (success) {
      toast({
        title: "Suscripción Exitosa",
        description: "Tu suscripción ha sido activada.",
        variant: "default",
      })
      router.replace("/dashboard/subscriptions", undefined) // Clear params
    } else if (canceled) {
      toast({
        title: "Suscripción Cancelada",
        description: "El proceso de pago fue cancelado.",
        variant: "destructive",
      })
      router.replace("/dashboard/subscriptions", undefined) // Clear params
    } else if (error) {
      toast({
        title: "Error en la Suscripción",
        description: "Hubo un problema con tu suscripción. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
      router.replace("/dashboard/subscriptions", undefined) // Clear params
    }
  }, [searchParams, router])

  const plans: Plan[] = [
    {
      id: "basic",
      name: "Básico",
      price: "$25/mes",
      features: ["Acceso a casos", "Soporte estándar", "5 GB almacenamiento"],
      stripePriceId: process.env.STRIPE_PRICE_ID_STANDARD!,
    },
    {
      id: "premium",
      name: "Premium",
      price: "$50/mes",
      features: [
        "Todas las características de Básico",
        "Soporte prioritario",
        "20 GB almacenamiento",
        "Análisis avanzados",
      ],
      stripePriceId: process.env.STRIPE_PRICE_ID_PREMIUM!,
    },
    {
      id: "collaborative",
      name: "Colaborativo",
      price: "$100/mes",
      features: [
        "Todas las características de Premium",
        "Múltiples usuarios",
        "50 GB almacenamiento",
        "Integraciones personalizadas",
      ],
      stripePriceId: process.env.STRIPE_PRICE_ID_COLLABORATIVE!,
    },
  ]

  const handleSubscribe = async (priceId: string) => {
    if (!user || !profile) {
      toast({
        title: "Error de Autenticación",
        description: "Necesitas iniciar sesión para suscribirte.",
        variant: "destructive",
      })
      return
    }

    try {
      await createCheckoutSession(priceId, user.id, user.email!)
    } catch (error) {
      console.error("Error during subscription:", error)
      toast({
        title: "Error de Suscripción",
        description: "No se pudo iniciar el proceso de pago. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleCancelSubscription = async () => {
    if (!profile?.stripe_subscription_id || !user?.id) {
      toast({
        title: "Error",
        description: "No hay una suscripción activa para cancelar.",
        variant: "destructive",
      })
      return
    }

    setIsCanceling(true)
    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: profile.stripe_subscription_id,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Suscripción Cancelada",
          description: "Tu suscripción ha sido cancelada exitosamente.",
        })
        // Optionally, refresh profile data or redirect
        router.refresh() // Revalidate data on the page
      } else {
        toast({
          title: "Error al Cancelar",
          description: data.error || "No se pudo cancelar la suscripción.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error canceling subscription:", error)
      toast({
        title: "Error al Cancelar",
        description: "Ocurrió un error inesperado al cancelar la suscripción.",
        variant: "destructive",
      })
    } finally {
      setIsCanceling(false)
    }
  }

  const currentPlan = plans.find((p) => p.stripePriceId === profile?.stripe_price_id)
  const isSubscribed = profile?.subscription_status === "active" && profile?.stripe_subscription_id

  if (isProfileLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="border-border/40">
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-8 w-1/3 mt-2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-foreground mb-6">Gestionar Suscripción</h2>

      {isSubscribed && currentPlan && (
        <Card className="border-emerald-500/40 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="text-emerald-400">Tu Plan Actual: {currentPlan.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-semibold text-foreground">Precio: {currentPlan.price}</p>
            <ul className="space-y-2 text-muted-foreground">
              {currentPlan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button variant="destructive" onClick={handleCancelSubscription} disabled={isCanceling} className="w-full">
              {isCanceling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Cancelar Suscripción"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <h3 className="text-2xl font-bold text-foreground mt-8 mb-4">Explora Nuestros Planes</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`border-border/40 ${isSubscribed && currentPlan?.id === plan.id ? "ring-2 ring-primary" : ""}`}
          >
            <CardHeader>
              <CardTitle className="text-foreground">{plan.name}</CardTitle>
              <p className="text-3xl font-bold text-foreground">{plan.price}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-muted-foreground">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              {isSubscribed ? (
                currentPlan?.id === plan.id ? (
                  <Button disabled className="w-full" variant="secondary">
                    Plan Actual
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(plan.stripePriceId)}
                    disabled={isCheckoutLoading || isCanceling}
                    className="w-full"
                  >
                    {isCheckoutLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      "Cambiar Plan"
                    )}
                  </Button>
                )
              ) : (
                <Button
                  onClick={() => handleSubscribe(plan.stripePriceId)}
                  disabled={isCheckoutLoading || isCanceling}
                  className="w-full"
                >
                  {isCheckoutLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    "Suscribirse"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
