"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingDown } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

const chartData = [
  { month: "Ene", income: 1870, expenses: 800 },
  { month: "Feb", income: 2000, expenses: 950 },
  { month: "Mar", income: 2200, expenses: 1100 },
  { month: "Abr", income: 2100, expenses: 1050 },
  { month: "May", income: 2300, expenses: 1200 },
  { month: "Jun", income: 2500, expenses: 1300 },
  { month: "Jul", income: 2400, expenses: 1150 },
  { month: "Ago", income: 2600, expenses: 1400 },
  { month: "Sep", income: 2700, expenses: 1500 },
  { month: "Oct", income: 2800, expenses: 1600 },
  { month: "Nov", income: 2900, expenses: 1700 },
  { month: "Dic", income: 3000, expenses: 1800 },
]

export function FinancialOverviewSection() {
  const [timeframe, setTimeframe] = useState("year") // 'month', 'quarter', 'year'

  const totalIncome = chartData.reduce((sum, data) => sum + data.income, 0)
  const totalExpenses = chartData.reduce((sum, data) => sum + data.expenses, 0)
  const netProfit = totalIncome - totalExpenses

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="grid gap-2">
          <CardTitle className="text-lg">Resumen Financiero</CardTitle>
          <p className="text-xs text-muted-foreground">Ingresos y gastos de los últimos 12 meses</p>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Mensual</SelectItem>
            <SelectItem value="quarter">Trimestral</SelectItem>
            <SelectItem value="year">Anual</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col items-center">
            <DollarSign className="h-6 w-6 text-green-500" />
            <span className="text-sm text-muted-foreground">Ingresos</span>
            <span className="text-lg font-bold">${totalIncome.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center">
            <TrendingDown className="h-6 w-6 text-red-500" />
            <span className="text-sm text-muted-foreground">Gastos</span>
            <span className="text-lg font-bold">${totalExpenses.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center">
            <DollarSign className="h-6 w-6 text-blue-500" />
            <span className="text-sm text-muted-foreground">Beneficio Neto</span>
            <span className="text-lg font-bold">${netProfit.toLocaleString()}</span>
          </div>
        </div>
        <ChartContainer
          config={{
            income: {
              label: "Ingresos",
              color: "hsl(var(--chart-1))",
            },
            expenses: {
              label: "Gastos",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="aspect-auto h-[250px] w-full"
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
            <Bar dataKey="income" fill="var(--color-income)" radius={8} />
            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
