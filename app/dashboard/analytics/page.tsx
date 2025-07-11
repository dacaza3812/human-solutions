"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, LineChart, PieChart } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, Users, DollarSign, TrendingUp, Award } from "lucide-react"
import { useState } from "react"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("month")

  const salesData = {
    month: [
      { name: "Ene", sales: 400 },
      { name: "Feb", sales: 300 },
      { name: "Mar", sales: 500 },
      { name: "Abr", sales: 450 },
      { name: "May", sales: 600 },
      { name: "Jun", sales: 550 },
    ],
    quarter: [
      { name: "Q1", sales: 1200 },
      { name: "Q2", sales: 1600 },
      { name: "Q3", sales: 1400 },
      { name: "Q4", sales: 1800 },
    ],
    year: [
      { name: "2022", sales: 5000 },
      { name: "2023", sales: 6500 },
      { name: "2024", sales: 7200 },
    ],
  }

  const clientAcquisitionData = {
    month: [
      { name: "Ene", clients: 10 },
      { name: "Feb", clients: 12 },
      { name: "Mar", clients: 8 },
      { name: "Abr", clients: 15 },
      { name: "May", clients: 11 },
      { name: "Jun", clients: 14 },
    ],
    quarter: [
      { name: "Q1", clients: 30 },
      { name: "Q2", clients: 40 },
      { name: "Q3", clients: 35 },
      { name: "Q4", clients: 45 },
    ],
    year: [
      { name: "2022", clients: 120 },
      { name: "2023", clients: 150 },
      { name: "2024", clients: 180 },
    ],
  }

  const caseStatusData = [
    { name: "Pendiente", value: 300, color: "var(--chart-1)" },
    { name: "En Progreso", value: 500, color: "var(--chart-2)" },
    { name: "Completado", value: 700, color: "var(--chart-3)" },
  ]

  const referralSourceData = [
    { name: "Boca a Boca", value: 400, color: "var(--chart-1)" },
    { name: "Redes Sociales", value: 300, color: "var(--chart-2)" },
    { name: "Publicidad", value: 200, color: "var(--chart-3)" },
    { name: "Otros", value: 100, color: "var(--chart-4)" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Análisis de Datos</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <CalendarDays className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Seleccionar Rango" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Último Mes</SelectItem>
            <SelectItem value="quarter">Último Trimestre</SelectItem>
            <SelectItem value="year">Último Año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">+180.1% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casos Activos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,234</div>
            <p className="text-xs text-muted-foreground">+19% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Retención</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">+5% desde el mes pasado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Rendimiento de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={salesData[timeRange as keyof typeof salesData]}
              categories={["sales"]}
              index="name"
              className="h-[300px]"
            />
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Adquisición de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={clientAcquisitionData[timeRange as keyof typeof clientAcquisitionData]}
              categories={["clients"]}
              index="name"
              className="h-[300px]"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Estado de Casos</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={caseStatusData} category="value" index="name" className="h-[300px]" />
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Fuentes de Referencia</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={referralSourceData} category="value" index="name" className="h-[300px]" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
