"use client"

import { FinancialCharts } from "@/components/financial-charts"

export function FinancialSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Vista Financiera</h2>
          <p className="text-muted-foreground">Análisis de ingresos y rendimiento</p>
        </div>
      </div>
      <FinancialCharts />
    </div>
  )
}
