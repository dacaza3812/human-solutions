"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, CreditCard, AlertCircle, Loader2, ExternalLink, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SubscriptionPlans } from "./subscription-plans"
import { toast } from "@/hooks/use-toast"

interface SubscriptionActiveProps {
  subscriptionInfo?: any
  paymentHistory?: any[]
  loadingPayments?: boolean
  onRefreshPayments?: () => void
}

export function SubscriptionActive({
  subscriptionInfo,
  paymentHistory = [],
  loadingPayments = false,
  onRefreshPayments,
}: SubscriptionActiveProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  // Si no hay información de suscripción, mostrar mensaje
  if (!subscriptionInfo) {
    return (
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
            Sin Suscripción Activa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No tienes una suscripción activa</p>
            <p className="text-sm text-muted-foreground">
              Selecciona un plan para comenzar a disfrutar de nuestros servicios
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "No disponible"
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
      case "past_due":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "succeeded":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activa"
      case "past_due":
        return "Pago Pendiente"
      case "cancelled":
        return "Cancelada"
      default:
        return "Inactiva"
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "succeeded":
        return "Exitoso"
      case "pending":
        return "Pendiente"
      case "failed":
        return "Fallido"
      case "cancelled":
        return "Cancelado"
      default:
        return "Desconocido"
    }
  }

  const handleCancelSubscription = async () => {
    setCancelling(true)
    try {
      // Aquí implementarías la lógica para cancelar la suscripción
      // Por ejemplo, llamar a una API que cancele la suscripción en Stripe

      // Simulación de cancelación
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Suscripción cancelada",
        description: "Tu suscripción ha sido cancelada exitosamente. Tendrás acceso hasta el final del período actual.",
      })

      setShowCancelDialog(false)

      // Aquí podrías refrescar la información de suscripción
      // onRefreshSubscription?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cancelar la suscripción. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Card */}
      <Card className="border-border/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-foreground">
              <CheckCircle className="w-5 h-5 mr-2 text-emerald-400" />
              Suscripción Actual
            </CardTitle>
            <Badge className={getStatusColor(subscriptionInfo.subscription_status || "inactive")}>
              {getStatusText(subscriptionInfo.subscription_status || "inactive")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Plan {subscriptionInfo.plans?.name || "Desconocido"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {subscriptionInfo.plans?.description || "Sin descripción disponible"}
              </p>
              <div className="text-3xl font-bold text-emerald-400">
                {formatCurrency(subscriptionInfo.plans?.price || 0, subscriptionInfo.plans?.currency || "USD")}
                <span className="text-lg text-muted-foreground">
                  /{subscriptionInfo.plans?.billing_interval === "month" ? "mes" : "año"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Inicio de suscripción</p>
                  <p className="font-medium">{formatDate(subscriptionInfo.subscription_start_date)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Próximo pago</p>
                  <p className="font-medium">{formatDate(subscriptionInfo.subscription_end_date)}</p>
                </div>
              </div>
            </div>
          </div>

          {subscriptionInfo.plans?.features && Array.isArray(subscriptionInfo.plans.features) && (
            <div>
              <h4 className="font-semibold mb-3">Características incluidas:</h4>
              <ul className="grid md:grid-cols-2 gap-2">
                {subscriptionInfo.plans.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border/40">
            <Dialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  Cambiar Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Cambiar Plan de Suscripción</DialogTitle>
                </DialogHeader>
                <SubscriptionPlans currentPlanId={subscriptionInfo.plan_id} />
              </DialogContent>
            </Dialog>

            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700">
                  Cancelar Suscripción
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancelar Suscripción</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      ¿Estás seguro de que quieres cancelar tu suscripción? Tendrás acceso a los servicios hasta el
                      final del período actual ({formatDate(subscriptionInfo.subscription_end_date)}).
                    </AlertDescription>
                  </Alert>
                  <p className="text-sm text-muted-foreground">
                    Una vez cancelada, no se te cobrará en el próximo período de facturación. Puedes reactivar tu
                    suscripción en cualquier momento.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                    Mantener Suscripción
                  </Button>
                  <Button variant="destructive" onClick={handleCancelSubscription} disabled={cancelling}>
                    {cancelling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cancelando...
                      </>
                    ) : (
                      "Confirmar Cancelación"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="border-border/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Historial de Pagos</CardTitle>
            <Button variant="outline" size="sm" onClick={onRefreshPayments} disabled={loadingPayments}>
              {loadingPayments ? <Loader2 className="w-4 h-4 animate-spin" /> : "Actualizar"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingPayments ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Cargando historial de pagos...</p>
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay historial de pagos disponible</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border border-border/40 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{formatCurrency(payment.amount, payment.currency)}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(payment.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <Badge className={getPaymentStatusColor(payment.status)}>
                        {getPaymentStatusText(payment.status)}
                      </Badge>
                      <span className="text-muted-foreground">Método: {payment.payment_method || "Tarjeta"}</span>
                      {payment.stripe_invoice_id && (
                        <span className="text-muted-foreground">Factura: {payment.stripe_invoice_id.slice(-8)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {payment.stripe_invoice_id && (
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Ver Factura
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Descargar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
