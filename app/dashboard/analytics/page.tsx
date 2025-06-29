"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, FileText } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

// Mock data for analytics
const chartData = [
  { month: "Ene", cases: 10, clients: 5 },
  { month: "Feb", cases: 12, clients: 6 },
  { month: "Mar", cases: 15, clients: 7 },
  { month: "Abr", cases: 13, clients: 6 },
  { month: "May", cases: 18, clients: 8 },
  { month: "Jun", cases: 20, clients: 9 },
]

export default function AnalyticsPage() {
  const { profile, loading } = useAuth()
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)

  useEffect(() => {
    // Simulate loading analytics data
    setLoadingAnalytics(true)
    setTimeout(() => {
      setLoadingAnalytics(false)
    }, 1000)
  }, [profile])

  if (loading || loadingAnalytics) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Cargando...</h3>
        <p className="text-muted-foreground">Cargando tus analíticas.</p>
      </div>
    )
  }

  if (profile?.account_type !== "advisor") {
    return (
      <div className="text-center py-12">
        <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-foreground mb-2">Acceso Denegado</h3>
        <p className="text-muted-foreground">Solo los usuarios con cuenta de asesor pueden acceder a esta sección.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Analíticas del Despacho</h2>
          <p className="text-muted-foreground">Obtén información valiosa sobre el rendimiento de tu despacho.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casos Abiertos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">+3 del mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos Clientes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+2 del mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Basado en casos cerrados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rendimiento Mensual</CardTitle>
          <CardDescription>Casos y clientes por mes.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              cases: { label: "Casos", color: "hsl(var(--primary))" },
              clients: { label: "Clientes", color: "hsl(var(--muted-foreground))" },
            }}
            className="min-h-[300px] w-full"
          >
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="cases" fill="var(--color-cases)" radius={8} />
              <Bar dataKey="clients" fill="var(--color-clients)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
