"use client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { useStripeCheckout } from "@/hooks/use-stripe-checkout"
import { supabase } from "@/lib/supabase"
import {
  CheckCircle,
  CreditCard,
  Calendar,
  DollarSign,
  AlertCircle,
  Loader2,
  Crown,
  Star,
  Zap,
  X,
  RefreshCw,
} from "lucide-react"
import { revalidatePath } from "next/cache"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface SubscriptionInfo {
  plan_id?: number
  plan_name?: string
  plan_price?: number
  plan_currency?: string
  plan_billing_interval?: string
  subscription_status?: string
  subscription_start_date?: string
  subscription_end_date?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
}

const plans = [
  {
    id: 1,
    name: "Standard",
    price: "$99.99",
    frequency: "mensual",
    description: "Ideal para necesidades básicas de asesoría.",
    features: ["Contacto directo con el CEO una vez por semana", "Acceso a conocimiento esotérico", "Comisión de un 50% por la activación de cada plan de sus referidos directos"],
    buttonText: "Elegir Plan Standard",
    highlight: false,
    icon: CheckCircle,
  },
  {
    id: 2,
    name: "Premium",
    price: "$999.99",
    frequency: "anual",
    description: "Para un soporte más completo y personalizado.",
    features: [
      "Pago único anual",
      "Ahorra +200 USD en tu curso anual",
      "Mayor compromiso con tu transformación",
    ],
    buttonText: "Elegir Plan Premium",
    highlight: true,
    icon: Crown,
  },
  {
    id: 3,
    name: "Professional Fox",
    price: "5000.00",
    frequency: "anual",
    description: "Solución integral para equipos o familias.",
    features: [
      "Asesoría de forma presencial con el CEO",
      "Todas las demás características del plan Standard y Premium",
    ],
    buttonText: "Elegir Plan Professional Fox",
    highlight: false,
    icon: Star,
  },
]

export default function SubscriptionsPage() {
const { session, profile } = useAuth()
  const { createCheckoutSession, loading: checkoutLoading, error: checkoutError } = useStripeCheckout()
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPlans, setShowPlans] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (profile && profile.id) {
      fetchSubscriptionInfo()
    } else {
      setLoading(false) // Si no hay perfil, termina la carga
    }
  }, [profile?.id])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setError("La carga está tardando demasiado. Inténtalo nuevamente.")
        setLoading(false)
      }
    }, 10000) // 10 segundos

    return () => clearTimeout(timer)
  }, [loading])

  const fetchSubscriptionInfo = async () => {
  try {
    setLoading(true); // Activa el estado de carga
    setError(null);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select(`
        plan_id,
        subscription_status,
        subscription_start_date,
        subscription_end_date,
        stripe_customer_id,
        stripe_subscription_id,
        plans:plan_id (
          id,
          name,
          price,
          currency,
          billing_interval
        )
      `)
      .eq("id", profile!.id)
      .single();

    if (profileError) throw profileError;

    if (profileData.subscription_status === "cancelled") {
      setSubscriptionInfo(null);
    } else if (profileData.plans) {
      setSubscriptionInfo({
        plan_id: profileData.plan_id,
        plan_name: profileData.plans.name,
        plan_price: profileData.plans.price,
        plan_currency: profileData.plans.currency,
        plan_billing_interval: profileData.plans.billing_interval,
        subscription_status: profileData.subscription_status,
        subscription_start_date: profileData.subscription_start_date,
        subscription_end_date: profileData.subscription_end_date,
        stripe_customer_id: profileData.stripe_customer_id,
        stripe_subscription_id: profileData.stripe_subscription_id,
      });
    } else {
      setSubscriptionInfo(null);
    }
  } catch (error) {
    console.error("Error fetching subscription info:", error);
    setError(error.message || "Error al cargar la información de suscripción.");
  } finally {
    setLoading(false); // Asegúrate de desactivar el estado de carga
  }
};
  



  const handlePlanSelection = async (planId: number) => {
    await createCheckoutSession(planId.toString())
  }

  const handleCancelSubscription = async () => {
    if (!subscriptionInfo?.stripe_subscription_id) return

    setCancelLoading(true)
    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          subscriptionId: subscriptionInfo.stripe_subscription_id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al cancelar la suscripción")
      }

      // Sólo recargamos datos, no router.refresh()
      await fetchSubscriptionInfo()
    } catch (err: any) {
      console.error("Error canceling subscription:", err)
      setError(err.message || "Error al cancelar la suscripción")
    } finally {
      setCancelLoading(false)
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">Activa</Badge>
        )
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Cancelada</Badge>
      case "past_due":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Vencida</Badge>
        )
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">Inactiva</Badge>
    }
  }

  const getPlanIcon = (planName?: string) => {
    switch (planName?.toLowerCase()) {
      case "premium":
        return Crown
      case "collaborative":
        return Star
      default:
        return CheckCircle
    }
  }

  if (loading) {
    return (
      <main className="flex-1 p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Suscripciones</h2>
              <p className="text-muted-foreground">Gestiona tu plan de suscripción</p>
            </div>
          </div>
          <Card className="border-border/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                <span className="ml-2 text-muted-foreground">Cargando información de suscripción...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Suscripciones</h2>
            <p className="text-muted-foreground">Gestiona tu plan de suscripción</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchSubscriptionInfo} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <main className="flex-1 p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Suscripciones</h2>
            <p className="text-muted-foreground">Gestiona tu plan de suscripción</p>
          </div>
          {subscriptionInfo && (
            <Button
              variant="outline"
              onClick={() => setShowPlans(!showPlans)}
              className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white"
            >
              {showPlans ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Ocultar Planes
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Cambiar Plan
                </>
              )}
            </Button>
          )}
        </div>
  
        {/* Error de checkout */}
        {checkoutError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{checkoutError}</AlertDescription>
          </Alert>
        )}
  
        {/* Información de suscripción actual */}
        {subscriptionInfo ? (
          <Card className="border-border/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const IconComponent = getPlanIcon(subscriptionInfo.plan_name)
                    return <IconComponent className="w-6 h-6 text-emerald-400" />
                  })()}
                  <div>
                    <CardTitle className="text-xl text-foreground">Plan {subscriptionInfo.plan_name}</CardTitle>
                    <CardDescription>Tu suscripción actual</CardDescription>
                  </div>
                </div>
                {getStatusBadge(subscriptionInfo.subscription_status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Precio</p>
                    <p className="font-semibold text-foreground">
                      {subscriptionInfo.plan_currency?.toUpperCase()} ${subscriptionInfo.plan_price}
                      <span className="text-sm text-muted-foreground">/{subscriptionInfo.plan_billing_interval}</span>
                    </p>
                  </div>
                </div>
  
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
                    <p className="font-semibold text-foreground">
                      {subscriptionInfo.subscription_start_date
                        ? new Date(subscriptionInfo.subscription_start_date).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
  
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Próximo Pago</p>
                    <p className="font-semibold text-foreground">
                      {subscriptionInfo.subscription_end_date
                        ? new Date(subscriptionInfo.subscription_end_date).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
  
              <Separator />
  
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPlans(!showPlans)}
                  className="flex-1 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Cambiar Plan
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelSubscription}
                  disabled={cancelLoading || subscriptionInfo.subscription_status !== "active"}
                  className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white bg-transparent"
                >
                  {cancelLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cancelando...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancelar Suscripción
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Sin suscripción activa */
          <Card className="border-border/40">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-foreground">No tienes una suscripción activa</CardTitle>
              <CardDescription>Elige un plan para comenzar a disfrutar de nuestros servicios</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-6">
                Selecciona uno de nuestros planes para acceder a asesoría personalizada y transformar tu vida.
              </p>
              <Button onClick={() => setShowPlans(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                Ver Planes Disponibles
              </Button>
            </CardContent>
          </Card>
        )}
  
        {/* Planes disponibles */}
        {showPlans && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-2">Planes Disponibles</h3>
              <p className="text-muted-foreground">
                {subscriptionInfo ? "Cambia a un plan diferente" : "Elige el plan que mejor se adapte a tus necesidades"}
              </p>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`border-border/40 ${plan.highlight ? "border-emerald-500 ring-2 ring-emerald-500" : ""} ${
                    subscriptionInfo?.plan_id === plan.id ? "bg-emerald-500/5 border-emerald-500" : "bg-card/50"
                  } hover:bg-card/80 transition-colors flex flex-col`}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="flex items-center justify-center mb-2">
                      <plan.icon className="w-8 h-8 text-emerald-400" />
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground">{plan.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
                    {subscriptionInfo?.plan_id === plan.id && (
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                        Plan Actual
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between p-6 pt-0">
                    <div className="text-center mb-6">
                      <p className="text-4xl font-bold text-foreground">
                        {plan.price}
                        <span className="text-lg text-muted-foreground">/{plan.frequency}</span>
                      </p>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${
                        plan.highlight
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                          : "bg-muted-foreground hover:bg-muted-foreground/80 text-white"
                      }`}
                      size="lg"
                      onClick={() => handlePlanSelection(plan.id)}
                      disabled={checkoutLoading || subscriptionInfo?.plan_id === plan.id}
                    >
                      {checkoutLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Procesando...
                        </>
                      ) : subscriptionInfo?.plan_id === plan.id ? (
                        "Plan Actual"
                      ) : (
                        plan.buttonText
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      </main>
    )
}