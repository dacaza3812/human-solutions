"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useStripeCheckout } from "@/hooks/use-stripe-checkout"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle2, XCircle } from "lucide-react"

interface Price {
  id: string
  name: string
  description: string
  price: string
  features: string[]
  isPopular?: boolean
}

interface Subscription {
  id: string
  status: string
  current_period_end: string
  price_id: string
}

const prices: Price[] = [
  {
    id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD!,
    name: "Estándar",
    description: "Perfecto para pequeñas firmas.",
    price: "$79/mes",
    features: [
      "Gestión de casos ilimitados",
      "Soporte prioritario",
      "Almacenamiento de 10GB",
      "Acceso a plantillas premium",
    ],
    isPopular: true,
  },
  {
    id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM!,
    name: "Premium",
    description: "Para firmas grandes y equipos.",
    price: "$199/mes",
    features: [
      "Todas las características de Estándar",
      "Soporte 24/7",
      "Almacenamiento ilimitado",
      "Integraciones personalizadas",
    ],
  },
  {
    id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_COLLABORATIVE!,
    name: "Colaborativo",
    description: "Para equipos que necesitan colaboración avanzada.",
    price: "$149/mes",
    features: [
      "Gestión de casos ilimitados",
      "Soporte prioritario",
      "Almacenamiento de 50GB",
      "Herramientas de colaboración en tiempo real",
      "Reportes avanzados",
    ],
  },
]

export function SubscriptionsSection() {
  const { user, profile } = useAuth()
  const { createCheckoutSession } = useStripeCheckout()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return

      setLoading(true)
      try {
        // Fetch user's subscription
        const { data: subData, error: subError } = await fetch(`/api/get-subscription?user_id=${user.id}`)
        const subscriptionData = await subData.json()

        if (subError) {
          console.error("Error fetching subscription:", subError)
          toast({
            title: "Error",
            description: "No se pudo cargar la información de la suscripción.",
            variant: "destructive",
          })
        } else if (subscriptionData) {
          setSubscription(subscriptionData)
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

    fetchSubscription()
  }, [user, toast])

  useEffect(() => {
    const status = searchParams.get("status")
    if (status === "success") {
      toast({
        title: "Suscripción Exitosa",
        description: "Tu suscripción ha sido activada.",
        variant: "default",
      })
    } else if (status === "cancelled") {
      toast({
        title: "Suscripción Cancelada",
        description: "El proceso de suscripción fue cancelado.",
        variant: "destructive",
      })
    } else if (status === "error") {
      toast({
        title: "Error de Suscripción",
        description: "Hubo un problema al procesar tu suscripción.",
        variant: "destructive",
      })
    }
  }, [searchParams, toast])

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      toast({
        title: "Error de Autenticación",
        description: "Debes iniciar sesión para suscribirte.",
        variant: "destructive",
      })
      return
    }
    await createCheckoutSession(priceId, user.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <CheckCircle2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="ml-2 text-muted-foreground">Cargando suscripciones...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Gestionar Suscripción</h2>
      <Card>
        <CardHeader>
          <CardTitle>Estado Actual de la Suscripción</CardTitle>
          <CardDescription>
            {profile?.stripe_subscription_id
              ? "Actualmente tienes una suscripción activa."
              : "No tienes una suscripción activa."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profile?.stripe_subscription_id ? (
            <div className="flex items-center gap-2 text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
              <span>Suscripción Activa</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-500">
              <XCircle className="h-5 w-5" />
              <span>Sin Suscripción Activa</span>
            </div>
          )}
          {/* Add button to manage subscription via Stripe portal if needed */}
          {profile?.stripe_subscription_id && (
            <Button variant="outline" className="mt-4 bg-transparent">
              Gestionar en Stripe
            </Button>
          )}
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold text-foreground mt-8">Nuestros Planes</h2>
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
        {prices.map((price) => (
          <Card
            key={price.id}
            className={`flex flex-col justify-between ${price.isPopular ? "border-2 border-emerald-500" : ""}`}
          >
            <CardHeader>
              <CardTitle>{price.name}</CardTitle>
              <CardDescription>{price.description}</CardDescription>
              <div className="text-4xl font-bold">{price.price}</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-left">
                {price.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-emerald-500 hover:bg-emerald-600"
                onClick={() => handleSubscribe(price.id)}
                disabled={profile?.stripe_subscription_id === price.id} // Disable if already subscribed to this plan
              >
                {profile?.stripe_subscription_id === price.id ? "Plan Actual" : "Elegir Plan"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
