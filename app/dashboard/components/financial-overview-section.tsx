"use client"
import { Input } from "@/components/ui/input"
import { FinancialCharts } from "@/components/financial-charts"

interface FinancialOverviewSectionProps {
  dateRange: {
    start: string
    end: string
  }
  setDateRange: (range: { start: string; end: string }) => void
}

export function FinancialOverviewSection({ dateRange, setDateRange }: FinancialOverviewSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Vista Financiera</h2>
          <p className="text-muted-foreground">Análisis detallado de ingresos, gastos y métricas financieras</p>
        </div>
        <div className="flex space-x-2">
          <Input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="w-40"
          />
          <Input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="w-40"
          />
        </div>
      </div>

      <FinancialCharts dateRange={dateRange} />
    </div>
  )
}
