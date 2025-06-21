"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, CreditCard, AlertCircle } from "lucide-react"

interface SubscriptionActiveProps {
  subscriptionInfo?: any
}

export function SubscriptionActive({ subscriptionInfo }: SubscriptionActiveProps) {
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
                ${subscriptionInfo.plans?.price || "0"}
                <span className="text-lg text-muted-foreground">/mes</span>
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
            <Button variant="outline" className="flex-1">
              Cambiar Plan
            </Button>
            <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700">
              Cancelar Suscripción
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-foreground">Historial de Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay historial de pagos disponible</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
