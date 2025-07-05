"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useStripeCheckout } from "@/hooks/use-stripe-checkout"
import { supabase } from "@/lib/supabase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Loader2,
  CheckCircle,
  CreditCard,
  Calendar,
  DollarSign,
  AlertCircle,
  Crown,
  Star,
  Zap,
  X,
  RefreshCw,
} from "lucide-react"

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

interface Subscription {
  id: string
  plan_id: number
  plans: { name: string; price: number }
  status: string
  current_period_start: string
  current_period_end: string
  stripe_subscription_id: string
  cancel_at_period_end: boolean
}

const plans = [
  {
    id: 1,
    name: "Standard",
    price: "$49.99",
    frequency: "mensual",
    description: "Ideal para necesidades básicas de asesoría.",
    features: ["3 consultas/mes", "Soporte por email", "Acceso a recursos básicos", "Prioridad estándar"],
    buttonText: "Elegir Plan Standard",
    highlight: false,
    icon: CheckCircle,
  },
  {
    id: 2,
    name: "Premium",
    price: "$149.99",
    frequency: "mensual",
    description: "Para un soporte más completo y personalizado.",
    features: [
      "10 consultas/mes",
      "Soporte prioritario",
      "Acceso a todos los recursos",
      "Seguimiento personalizado",
      "Prioridad alta",
    ],
    buttonText: "Elegir Plan Premium",
    highlight: true,
    icon: Crown,
  },
  {
    id: 3,
    name: "Collaborative",
    price: "$299.99",
    frequency: "mensual",
    description: "Solución integral para equipos o familias.",
    features: [
      "Consultas ilimitadas",
      "Asesor dedicado 24/7",
      "Acceso para equipos",
      "Reportes personalizados",
      "Prioridad empresarial",
    ],
    buttonText: "Elegir Plan Collaborative",
    highlight: false,
    icon: Star,
  },
]

export function SubscriptionsSection() {
  const { user, profile } = useAuth()
  const { createCheckoutSession, loading: checkoutLoading, error: checkoutError } = useStripeCheckout()
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPlans, setShowPlans] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loadingSubscriptionId, setLoadingSubscriptionId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (profile?.id) {
      fetchSubscriptionInfo()
    }
  }, [profile])

  const fetchSubscriptionInfo = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener información de suscripción del perfil del usuario
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
        .eq("id", profile?.id)
        .single()

      if (profileError) {
        throw profileError
      }

      if (profileData && profileData.plans) {
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
        })
      } else {
        setSubscriptionInfo(null)
      }

      // Fetch historical subscriptions
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("stripe_customer_id", profileData.stripe_customer_id)

      if (subscriptionsError) {
        throw subscriptionsError
      }

      setSubscriptions(subscriptionsData || [])
    } catch (err: any) {
      console.error("Error fetching subscription info:", err)
      setError(err.message || "Error al cargar la información de suscripción")
    } finally {
      setLoading(false)
    }
  }

  const handlePlanSelection = async (planId: number) => {
    await createCheckoutSession(planId)
  }

  const handleCancelSubscription = async (subscriptionId: string) => {
    setLoadingSubscriptionId(subscriptionId)
    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriptionId }),
      })
      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Suscripción Cancelada",
          description: "Tu suscripción ha sido cancelada exitosamente.",
        })
        // Update the local state to reflect the cancellation
        setSubscriptions((prevSubs) =>
          prevSubs.map((sub) =>
            sub.stripe_subscription_id === subscriptionId
              ? {
                  ...sub,
                  status: data.subscription.status,
                  cancel_at_period_end: data.subscription.cancel_at_period_end,
                }
              : sub,
          ),
        )
      } else {
        toast({
          title: "Error al Cancelar",
          description: data.error || "No se pudo cancelar la suscripción.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error)
      toast({
        title: "Error de Red",
        description: "No se pudo conectar con el servidor para cancelar la suscripción.",
        variant: "destructive",
      })
    } finally {
      setLoadingSubscriptionId(null)
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">Activa</Badge>
        )
      case "canceled":
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

      {/* Historial de Suscripciones */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Suscripciones</CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <p className="text-center text-muted-foreground">No tienes suscripciones activas o pasadas.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>{sub.plans?.name || "N/A"}</TableCell>
                    <TableCell>${sub.plans?.price?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          sub.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : sub.status === "canceled" || sub.status === "unpaid"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </TableCell>
                    <TableCell>{format(new Date(sub.current_period_start), "dd/MM/yyyy", { locale: es })}</TableCell>
                    <TableCell>{format(new Date(sub.current_period_end), "dd/MM/yyyy", { locale: es })}</TableCell>
                    <TableCell className="text-right">
                      {sub.status === "active" && !sub.cancel_at_period_end && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelSubscription(sub.stripe_subscription_id)}
                          disabled={loadingSubscriptionId === sub.stripe_subscription_id}
                        >
                          {loadingSubscriptionId === sub.stripe_subscription_id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            "Cancelar"
                          )}
                        </Button>
                      )}
                      {sub.cancel_at_period_end && (
                        <span className="text-sm text-muted-foreground">Cancela al final del período</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
