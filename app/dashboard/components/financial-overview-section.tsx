"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FinancialCharts } from "@/components/financial-charts"

interface FinancialOverviewSectionProps {
  dateRange: { start: string; end: string }
  setDateRange: (range: { start: string; end: string }) => void
}

export function FinancialOverviewSection({ dateRange, setDateRange }: FinancialOverviewSectionProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value)
    // In a real application, you would adjust dateRange based on the selected period
    // For now, we'll keep a static range for demonstration.
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Vista Financiera</h2>
          <p className="text-muted-foreground">Análisis de ingresos y rendimiento.</p>
        </div>
        <Select onValueChange={handlePeriodChange} value={selectedPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Diario</SelectItem>
            <SelectItem value="weekly">Semanal</SelectItem>
            <SelectItem value="monthly">Mensual</SelectItem>
            <SelectItem value="quarterly">Trimestral</SelectItem>
            <SelectItem value="yearly">Anual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">$15,000</div>
            <p className="text-xs text-muted-foreground">+10% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">120</div>
            <p className="text-xs text-muted-foreground">+5 nuevos clientes</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Casos Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">85</div>
            <p className="text-xs text-muted-foreground">+15% de eficiencia</p>
          </CardContent>
        </Card>
      </div>

      <FinancialCharts dateRange={dateRange} />
    </div>
  )
}
