"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { SubscriptionActive } from "@/components/subscription-active" // Corrected import path
import SubscriptionPlans from "@/components/subscription-plans" // Corrected import for default export

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
  const hasActiveSubscription = subscriptionInfo?.subscription_status === "active" && subscriptionInfo.plans

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Suscripciones</h2>
        <p className="text-muted-foreground">Gestiona tu plan de suscripción activo</p>
      </div>

      {loadingSubscription ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="ml-2 text-muted-foreground">Cargando estado de suscripción...</p>
        </div>
      ) : hasActiveSubscription ? (
        <SubscriptionActive
          subscriptionInfo={subscriptionInfo}
          loadingSubscription={loadingSubscription}
          paymentHistory={paymentHistory}
          loadingPayments={loadingPayments}
          onRefreshPayments={onRefreshPayments}
        />
      ) : (
        <Card className="bg-card text-card-foreground border-border/40">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">Explora Nuestros Planes</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionPlans />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
