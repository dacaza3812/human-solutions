"use client"

import { FinancialCharts } from "@/components/financial-charts"
import { useAuth } from "@/contexts/auth-context"
import { FileText } from "lucide-react"
import { useState } from "react"

export default function AnalyticsPage() {
  const { profile, loading } = useAuth()
  const [dateRange, setDateRange] = useState({
    start: "2024-01-01",
    end: "2024-12-31",
  })

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Cargando...</h3>
        <p className="text-muted-foreground">Cargando análisis.</p>
      </div>
    )
  }

  if (profile?.account_type !== "advisor") {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Acceso Restringido</h3>
        <p className="text-muted-foreground">Esta sección está disponible solo para asesores.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Análisis</h2>
          <p className="text-muted-foreground">Revisa tus métricas de rendimiento</p>
        </div>
      </div>
      <FinancialCharts dateRange={dateRange} setDateRange={setDateRange} />
    </div>
  )
}
