"use client"

import { Card, CardContent } from "@/components/ui/card"
import { SubscriptionActive } from "@/components/subscription-active"
import { SubscriptionPlans } from "@/components/subscription-plans"
import { Loader2 } from "lucide-react"

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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Suscripciones</h2>
          <p className="text-muted-foreground">Gestiona tu plan de suscripción</p>
        </div>
      </div>

      {loadingSubscription ? (
        <Card className="border-border/40">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando información de suscripción...</p>
          </CardContent>
        </Card>
      ) : subscriptionInfo && subscriptionInfo.subscription_status === "active" ? (
        <SubscriptionActive
          subscriptionInfo={subscriptionInfo}
          paymentHistory={paymentHistory}
          loadingPayments={loadingPayments}
          onRefreshPayments={onRefreshPayments}
        />
      ) : (
        <SubscriptionPlans currentPlanId={subscriptionInfo?.plan_id} />
      )}
    </div>
  )
}
