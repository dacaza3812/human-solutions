"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle } from "lucide-react"
import { FinancialCharts } from "@/components/financial-charts" // Reusing for mock analytics

export default function AnalyticsPage() {
  const { profile, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && profile?.account_type === "advisor") {
      // Simulate data fetching for analytics
      const timer = setTimeout(() => {
        setLoading(false)
      }, 1000) // Simulate network delay
      return () => clearTimeout(timer)
    } else if (!authLoading && profile?.account_type !== "advisor") {
      setLoading(false) // Not an advisor, so no analytics to load
    }
  }, [profile, authLoading])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  if (profile?.account_type !== "advisor") {
    return (
      <div className="text-center py-12">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-foreground mb-2">Acceso Denegado</h3>
        <p className="text-muted-foreground">Esta sección es solo para asesores.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Análisis y Reportes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Casos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">45</p>
            <p className="text-sm text-muted-foreground">Total de casos en progreso</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Nuevos Clientes (Mes)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">12</p>
            <p className="text-sm text-muted-foreground">Clientes adquiridos este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tasa de Conversión</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-purple-600">18%</p>
            <p className="text-sm text-muted-foreground">De prospectos a clientes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rendimiento Mensual</CardTitle>
        </CardHeader>
        <CardContent>
          <FinancialCharts /> {/* Reusing for a mock chart */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reporte de Referidos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aquí se mostrarán gráficos y tablas detalladas sobre el rendimiento de los referidos.
          </p>
          {/* Placeholder for more detailed referral analytics */}
        </CardContent>
      </Card>
    </div>
  )
}
