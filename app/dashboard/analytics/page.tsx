"use client"

import { useAuth } from "@/contexts/auth-context"
import { BarChart3 } from "lucide-react"

export default function AnalyticsPage() {
  const { profile, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (profile?.account_type !== "advisor") {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-foreground mb-2">Acceso Denegado</h3>
        <p className="text-muted-foreground">Esta sección solo está disponible para asesores.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-foreground">Análisis</h2>
      <p className="text-muted-foreground">Revisa tus métricas y rendimiento.</p>
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Vista en Desarrollo</h3>
        <p className="text-muted-foreground">La sección "Análisis" estará disponible próximamente.</p>
      </div>
    </div>
  )
}
