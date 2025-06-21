"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, Download, ExternalLink, CreditCard, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface SubscriptionActiveProps {
  subscriptionInfo: any
  loadingSubscription: boolean
  paymentHistory: any[]
  loadingPayments: boolean
  onRefreshPayments: () => void
}

export function SubscriptionActive({
  subscriptionInfo,
  loadingSubscription,
  paymentHistory,
  loadingPayments,
  onRefreshPayments,
}: SubscriptionActiveProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-900/20 text-emerald-400 border border-emerald-500/20"
      case "past_due":
        return "bg-orange-900/20 text-orange-400 border border-orange-500/20"
      case "cancelled":
        return "bg-red-900/20 text-red-400 border border-red-500/20"
      default:
        return "bg-gray-900/20 text-gray-400 border border-gray-500/20"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "succeeded":
        return "bg-emerald-900/20 text-emerald-400"
      case "failed":
        return "bg-red-900/20 text-red-400"
      case "pending":
        return "bg-yellow-900/20 text-yellow-400"
      default:
        return "bg-gray-900/20 text-gray-400"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: es })
    } catch (e) {
      console.error("Error formatting date:", dateString, e)
      return "Fecha inválida"
    }
  }

  if (loadingSubscription) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="ml-2 text-muted-foreground">Cargando información de suscripción...</p>
      </div>
    )
  }

  const hasActiveSubscription = subscriptionInfo?.subscription_status === "active" && subscriptionInfo.plans

  return (
    <div className="space-y-8">
      {/* Current Subscription Section */}
      <Card className="bg-card text-card-foreground border-border/40">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-emerald-500" />
            <CardTitle className="text-xl font-semibold text-foreground">Suscripción Actual</CardTitle>
          </div>
          {hasActiveSubscription && (
            <Badge className={getStatusColor(subscriptionInfo.subscription_status)}>
              {subscriptionInfo.subscription_status === "active" ? "Activa" : subscriptionInfo.subscription_status}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {hasActiveSubscription ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{subscriptionInfo.plans.name}</h3>
                  <p className="text-sm text-muted-foreground">{subscriptionInfo.plans.description}</p>
                  <p className="text-3xl font-bold text-emerald-400 mt-2">
                    ${subscriptionInfo.plans.price.toFixed(2)}{" "}
                    <span className="text-base font-medium text-muted-foreground">
                      /{subscriptionInfo.plans.billing_interval === "month" ? "mes" : "año"}
                    </span>
                  </p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      Inicio de suscripción:{" "}
                      <span className="font-medium text-foreground">
                        {formatDate(subscriptionInfo.subscription_start_date)}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      Próximo pago:{" "}
                      <span className="font-medium text-foreground">
                        {formatDate(subscriptionInfo.subscription_end_date)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <Separator className="bg-border/40" />
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="flex-1 border-border/40 text-foreground hover:bg-muted/50">
                  Cambiar Plan
                </Button>
                <Button variant="outline" className="flex-1 border-red-500/40 text-red-400 hover:bg-red-500/10">
                  Cancelar Suscripción
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tienes una suscripción activa.</p>
              <Button className="mt-4 bg-emerald-500 hover:bg-emerald-600">Explorar Planes</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History Section */}
      <Card className="bg-card text-card-foreground border-border/40">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl font-semibold text-foreground">Historial de Pagos</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefreshPayments}
            disabled={loadingPayments}
            className="border-border/40 text-foreground hover:bg-muted/50"
          >
            {loadingPayments ? <Loader2 className="h-4 w-4 animate-spin" /> : "Actualizar"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingPayments ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              <p className="ml-2 text-muted-foreground">Cargando historial de pagos...</p>
            </div>
          ) : paymentHistory.length > 0 ? (
            paymentHistory.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border border-border/40 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">
                      ${payment.amount.toFixed(2)} {payment.currency.toUpperCase()}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatDate(payment.created_at)}</p>
                    <div className="flex items-center space-x-2 text-xs mt-1">
                      <Badge className={getPaymentStatusColor(payment.status)}>
                        {payment.status === "succeeded" ? "Exitoso" : payment.status}
                      </Badge>
                      <span className="text-muted-foreground">Método: {payment.payment_method || "N/A"}</span>
                      {payment.stripe_invoice_id && (
                        <span className="text-muted-foreground">
                          Factura: {payment.stripe_invoice_id.substring(0, 8)}...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {payment.stripe_invoice_id && (
                    <Button variant="outline" size="sm" className="border-border/40 text-foreground hover:bg-muted/50">
                      <ExternalLink className="h-4 w-4 mr-1" /> Ver Factura
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="border-border/40 text-foreground hover:bg-muted/50">
                    <Download className="h-4 w-4 mr-1" /> Descargar
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay historial de pagos disponible.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
