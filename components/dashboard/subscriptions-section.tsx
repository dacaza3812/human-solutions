"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

interface Subscription {
  id: string
  status: string
  current_period_end: string
  price_id: string
}

interface PriceDetails {
  productName: string
  unitAmount: number
  interval: string
  priceId: string
}

export function SubscriptionsSection() {
  const { user, profile, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [prices, setPrices] = useState<PriceDetails[]>([])

  useEffect(() => {
    const fetchSubscriptionAndPrices = async () => {
      if (authLoading || !user) return

      setLoading(true)
      try {
        // Fetch user's subscription
        const { data: subData, error: subError } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (subError && subError.code !== "PGRST116") {
          // PGRST116 means no rows found, which is fine for new users
          console.error("Error fetching subscription:", subError)
          toast({
            title: "Error",
            description: "No se pudo cargar la información de la suscripción.",
            variant: "destructive",
          })
        } else if (subData) {
          setSubscription(subData)
        }

        // Fetch all available prices from Stripe
        const pricesResponse = await fetch("/api/stripe/get-all-prices")
        const pricesData = await pricesResponse.json()

        if (pricesData.error) {
          console.error("Error fetching prices:", pricesData.error)
          toast({
            title: "Error",
            description: "No se pudieron cargar los planes de suscripción.",
            variant: "destructive",
          })
        } else {
          setPrices(pricesData.prices)
        }
      } catch (error) {
        console.error("Unexpected error fetching data:", error)
        toast({
          title: "Error",
          description: "Ocurrió un error inesperado al cargar la página.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptionAndPrices()
  }, [user, authLoading, toast])

  const handleManageSubscription = async () => {
    if (!user || !profile?.stripe_customer_id || !subscription?.id) {
      toast({
        title: "Error",
        description: "No se pudo gestionar la suscripción. Faltan datos.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: profile.stripe_customer_id,
          subscriptionId: subscription.id, // Indicate that we want a billing portal session
        }),
      })
      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        toast({
          title: "Error",
          description: data.error || "No se pudo redirigir al portal de gestión de suscripciones.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error managing subscription:", error)
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error inesperado al gestionar la suscripción.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para suscribirte.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      let customerId = profile?.stripe_customer_id

      // If no Stripe customer ID, create one
      if (!customerId) {
        const { data: newCustomerData, error: newCustomerError } = await supabase
          .from("profiles")
          .select("stripe_customer_id")
          .eq("id", user.id)
          .single()

        if (newCustomerError || !newCustomerData?.stripe_customer_id) {
          // Create customer in Stripe if not found in DB
          const customerResponse = await fetch("/api/stripe/create-customer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email, userId: user.id }),
          })
          const customerData = await customerResponse.json()
          if (customerData.error) {
            throw new Error(customerData.error)
          }
          customerId = customerData.customerId
          // Update profile in DB with new customer ID
          await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id)
        } else {
          customerId = newCustomerData.stripe_customer_id
        }
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, customerId }),
      })
      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        toast({
          title: "Error de Suscripción",
          description: data.error || "No se pudo iniciar la sesión de pago.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error during subscription:", error)
      toast({
        title: "Error de Suscripción",
        description: error.message || "Ocurrió un error inesperado al procesar la suscripción.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="ml-2 text-muted-foreground">Cargando suscripciones...</p>
      </div>
    )
  }

  const currentPlan = prices.find((p) => p.priceId === subscription?.price_id)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Estado de tu Suscripción</CardTitle>
          <CardDescription>Gestiona tu plan de suscripción actual.</CardDescription>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-2">
              <p className="text-lg font-semibold flex items-center">
                Estado:{" "}
                {subscription.status === "active" ? (
                  <span className="ml-2 text-emerald-500 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-1" /> Activa
                  </span>
                ) : (
                  <span className="ml-2 text-destructive flex items-center">
                    <XCircle className="h-5 w-5 mr-1" /> {subscription.status}
                  </span>
                )}
              </p>
              {currentPlan && (
                <p>
                  Plan Actual: <span className="font-medium">{currentPlan.productName}</span> (
                  {`$${(currentPlan.unitAmount / 100).toFixed(2)}/${currentPlan.interval}`})
                </p>
              )}
              <p>
                Fin del Periodo Actual:{" "}
                <span className="font-medium">{new Date(subscription.current_period_end).toLocaleDateString()}</span>
              </p>
              <Button onClick={handleManageSubscription} className="mt-4 bg-emerald-500 hover:bg-emerald-600">
                Gestionar Suscripción
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-semibold">No tienes una suscripción activa.</p>
              <p className="text-muted-foreground">Explora nuestros planes a continuación para comenzar.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Explora Nuestros Planes</CardTitle>
          <CardDescription>Elige el plan que mejor se adapte a tus necesidades.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          {prices.map((price) => (
            <Card
              key={price.priceId}
              className={`flex flex-col ${
                subscription?.price_id === price.priceId ? "border-2 border-emerald-500" : ""
              }`}
            >
              <CardHeader>
                <CardTitle>{price.productName}</CardTitle>
                <CardDescription>{`$${(price.unitAmount / 100).toFixed(2)} / ${price.interval}`}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {/* Add plan features here if available in price details */}
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  <li>Acceso a funciones básicas</li>
                  <li>Soporte por correo electrónico</li>
                </ul>
              </CardContent>
              <div className="p-4 pt-0">
                <Button
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => handleSubscribe(price.priceId)}
                  disabled={loading || subscription?.price_id === price.priceId}
                >
                  {subscription?.price_id === price.priceId ? "Plan Actual" : "Seleccionar Plan"}
                </Button>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
