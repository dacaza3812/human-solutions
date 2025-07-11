"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, LineChart } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, DollarSign, TrendingUp } from "lucide-react"
import { useState } from "react"
import { ReferralTransactionsTable } from "./referral-transactions-table" // Import the new component

interface FinancialOverviewSectionProps {
  advisorId: string // Add advisorId prop
}

export function FinancialOverviewSection({ advisorId }: FinancialOverviewSectionProps) {
  const [timeRange, setTimeRange] = useState("month")

  const revenueData = {
    month: [
      { name: "Ene", revenue: 1200 },
      { name: "Feb", revenue: 1500 },
      { name: "Mar", revenue: 1300 },
      { name: "Abr", revenue: 1600 },
      { name: "May", revenue: 1800 },
      { name: "Jun", revenue: 1700 },
    ],
    quarter: [
      { name: "Q1", revenue: 4000 },
      { name: "Q2", revenue: 4500 },
      { name: "Q3", revenue: 4200 },
      { name: "Q4", revenue: 4800 },
    ],
    year: [
      { name: "2022", revenue: 15000 },
      { name: "2023", revenue: 18000 },
      { name: "2024", revenue: 20000 },
    ],
  }

  const expensesData = {
    month: [
      { name: "Ene", expenses: 800 },
      { name: "Feb", expenses: 900 },
      { name: "Mar", expenses: 750 },
      { name: "Abr", expenses: 850 },
      { name: "May", expenses: 950 },
      { name: "Jun", expenses: 900 },
    ],
    quarter: [
      { name: "Q1", expenses: 2500 },
      { name: "Q2", expenses: 2800 },
      { name: "Q3", expenses: 2600 },
      { name: "Q4", expenses: 2900 },
    ],
    year: [
      { name: "2022", expenses: 9000 },
      { name: "2023", expenses: 10500 },
      { name: "2024", expenses: 11000 },
    ],
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Resumen Financiero</h2>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$15,000.00</div>
            <p className="text-xs text-muted-foreground">-5.2% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Neta</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$30,231.89</div>
            <p className="text-xs text-muted-foreground">+30.5% desde el mes pasado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Tendencia de Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={revenueData[timeRange as keyof typeof revenueData]}
              categories={["revenue"]}
              index="name"
              className="h-[300px]"
            />
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Tendencia de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={expensesData[timeRange as keyof typeof expensesData]}
              categories={["expenses"]}
              index="name"
              className="h-[300px]"
            />
          </CardContent>
        </Card>
      </div>

      {/* New section for Referral Transactions */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Transacciones de Referidos</CardTitle>
        </CardHeader>
        <CardContent>
          <ReferralTransactionsTable advisorId={advisorId} />
        </CardContent>
      </Card>
    </div>
  )
}
