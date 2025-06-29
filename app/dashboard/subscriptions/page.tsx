"use client"

import { SubscriptionsSection } from "@/components/dashboard/subscriptions-section"
import { useAuth } from "@/contexts/auth-context"
import { FileText } from "lucide-react"

export default function SubscriptionsPage() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Cargando...</h3>
        <p className="text-muted-foreground">Cargando información de suscripción.</p>
      </div>
    )
  }

  // Only show subscriptions for clients
  if (profile?.account_type !== "client") {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Acceso Restringido</h3>
        <p className="text-muted-foreground">Esta sección está disponible solo para clientes.</p>
      </div>
    )
  }

  return <SubscriptionsSection />
}
