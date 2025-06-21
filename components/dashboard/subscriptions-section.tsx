"use client"

import { Card, CardContent } from "@/components/ui/card"
import { SubscriptionActive } from "@/components/subscription-active"
import { SubscriptionPlans } from "@/components/subscription-plans"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SubscriptionsSectionProps {
  subscriptionInfo: any
  loadingSubscription: boolean
  paymentHistory: any[]
  loadingPayments: boolean
  onRefreshPayments: () => void
}

export function SubscriptionsSection({
  subscriptionInfo,
  loadingSubscription,
  paymentHistory,
  loadingPayments,
  onRefreshPayments,
}: SubscriptionsSectionProps) {
  // Show loading state
  if (loadingSubscription) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Suscripciones</h2>
            <p className="text-muted-foreground">Gestiona tu plan de suscripción</p>
          </div>
        </div>

        <Card className="border-border/40">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando información de suscripción...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if user has an active subscription
  const hasActiveSubscription =
    subscriptionInfo && subscriptionInfo.subscription_status === "active" && subscriptionInfo.plan_id

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Suscripciones</h2>
          <p className="text-muted-foreground">
            {hasActiveSubscription ? "Gestiona tu plan de suscripción activo" : "Elige un plan para comenzar"}
          </p>
        </div>
      </div>

      {/* Show error if subscription info failed to load */}
      {!loadingSubscription && subscriptionInfo === null && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No se pudo cargar la información de suscripción. Los planes disponibles se muestran a continuación.
          </AlertDescription>
        </Alert>
      )}

      {/* Show active subscription or available plans */}
      {hasActiveSubscription ? (
        <SubscriptionActive
          subscriptionInfo={subscriptionInfo}
          paymentHistory={paymentHistory}
          loadingPayments={loadingPayments}
          onRefreshPayments={onRefreshPayments}
        />
      ) : (
        <div className="space-y-4">
          {!hasActiveSubscription && subscriptionInfo && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No tienes una suscripción activa. Selecciona un plan para comenzar a disfrutar de nuestros servicios.
              </AlertDescription>
            </Alert>
          )}
          <SubscriptionPlans currentPlanId={subscriptionInfo?.plan_id} />
        </div>
      )}
    </div>
  )
}
