"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

// Mock financial data
const monthlyEarnings = [
  { month: "Ene", earnings: 12500, expenses: 8200 },
  { month: "Feb", earnings: 15800, expenses: 9100 },
  { month: "Mar", earnings: 18200, expenses: 10500 },
  { month: "Apr", earnings: 16900, expenses: 9800 },
  { month: "May", earnings: 21300, expenses: 11200 },
  { month: "Jun", earnings: 19800, expenses: 10800 },
  { month: "Jul", earnings: 23500, expenses: 12100 },
  { month: "Ago", earnings: 25200, expenses: 13500 },
  { month: "Sep", earnings: 22800, expenses: 12800 },
  { month: "Oct", earnings: 26500, expenses: 14200 },
  { month: "Nov", earnings: 28900, expenses: 15100 },
  { month: "Dic", earnings: 31200, expenses: 16800 },
]

const transactionData = [
  {
    id: 1,
    date: "2024-01-15",
    client: "María González",
    type: "Ingreso",
    amount: 1500,
    category: "Consulta Legal",
    status: "Completado",
  },
  {
    id: 2,
    date: "2024-01-16",
    client: "Carlos Rodríguez",
    type: "Ingreso",
    amount: 2200,
    category: "Mediación Familiar",
    status: "Completado",
  },
  {
    id: 3,
    date: "2024-01-17",
    client: "Ana Martínez",
    type: "Ingreso",
    amount: 800,
    category: "Asesoría Financiera",
    status: "Pendiente",
  },
  {
    id: 4,
    date: "2024-01-18",
    client: "Luis Fernández",
    type: "Ingreso",
    amount: 3500,
    category: "Consulta Empresarial",
    status: "Completado",
  },
  {
    id: 5,
    date: "2024-01-19",
    client: "Oficina",
    type: "Gasto",
    amount: -450,
    category: "Servicios",
    status: "Completado",
  },
  {
    id: 6,
    date: "2024-01-20",
    client: "Software",
    type: "Gasto",
    amount: -120,
    category: "Tecnología",
    status: "Completado",
  },
  {
    id: 7,
    date: "2024-01-21",
    client: "Patricia Silva",
    type: "Ingreso",
    amount: 1800,
    category: "Consulta Legal",
    status: "Completado",
  },
  {
    id: 8,
    date: "2024-01-22",
    client: "Roberto Díaz",
    type: "Ingreso",
    amount: 2800,
    category: "Mediación",
    status: "Pendiente",
  },
]

interface FinancialChartsProps {
  dateRange: { start: string; end: string }
}

export function FinancialCharts({ dateRange }: FinancialChartsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  // Filter transactions based on search and type
  const filteredTransactions = transactionData.filter((transaction) => {
    const matchesSearch =
      transaction.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || transaction.type.toLowerCase() === filterType.toLowerCase()
    return matchesSearch && matchesType
  })

  // Calculate totals
  const totalIncome = transactionData.filter((t) => t.type === "Ingreso").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = Math.abs(
    transactionData.filter((t) => t.type === "Gasto").reduce((sum, t) => sum + t.amount, 0),
  )
  const netProfit = totalIncome - totalExpenses

  // Get max value for chart scaling
  const maxEarnings = Math.max(...monthlyEarnings.map((m) => m.earnings))

  const data = [
    { name: "Ene", Ingresos: 4000, Gastos: 2400 },
    { name: "Feb", Ingresos: 3000, Gastos: 1398 },
    { name: "Mar", Ingresos: 2000, Gastos: 9800 },
    { name: "Abr", Ingresos: 2780, Gastos: 3908 },
    { name: "May", Ingresos: 1890, Gastos: 4800 },
    { name: "Jun", Ingresos: 2390, Gastos: 3800 },
    { name: "Jul", Ingresos: 3490, Gastos: 4300 },
  ]

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                <p className="text-2xl font-bold text-foreground">${totalIncome.toLocaleString()}</p>
                <p className="text-sm text-emerald-400">+12.5% vs mes anterior</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gastos Totales</p>
                <p className="text-2xl font-bold text-foreground">${totalExpenses.toLocaleString()}</p>
                <p className="text-sm text-red-400">+3.2% vs mes anterior</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ganancia Neta</p>
                <p className="text-2xl font-bold text-foreground">${netProfit.toLocaleString()}</p>
                <p className="text-sm text-blue-400">+18.7% vs mes anterior</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes Activos</p>
                <p className="text-2xl font-bold text-foreground">124</p>
                <p className="text-sm text-purple-400">+8 nuevos este mes</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[300px]">
          <h3 className="text-lg font-semibold mb-2">Ingresos vs. Gastos Mensuales</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Ingresos" fill="#22c55e" />
              <Bar dataKey="Gastos" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-[300px]">
          <h3 className="text-lg font-semibold mb-2">Tendencia de Ingresos</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="Ingresos" stroke="#22c55e" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Earnings Chart */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <TrendingUp className="w-5 h-5 mr-2 text-emerald-400" />
            Ingresos vs Gastos Mensuales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-end space-x-2">
            {monthlyEarnings.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                <div className="w-full flex flex-col space-y-1">
                  {/* Earnings bar */}
                  <div
                    className="bg-emerald-500 rounded-t"
                    style={{
                      height: `${(data.earnings / maxEarnings) * 200}px`,
                      minHeight: "4px",
                    }}
                  ></div>
                  {/* Expenses bar */}
                  <div
                    className="bg-red-400 rounded-b"
                    style={{
                      height: `${(data.expenses / maxEarnings) * 200}px`,
                      minHeight: "4px",
                    }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground">{data.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded"></div>
              <span className="text-sm text-muted-foreground">Ingresos</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded"></div>
              <span className="text-sm text-muted-foreground">Gastos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-foreground">Transacciones Recientes</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium">
                Buscar
              </Label>
              <Input
                id="search"
                placeholder="Buscar por cliente o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="filter" className="text-sm font-medium">
                Filtrar por tipo
              </Label>
              <div className="flex space-x-2 mt-1">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("all")}
                >
                  Todos
                </Button>
                <Button
                  variant={filterType === "ingreso" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("ingreso")}
                >
                  Ingresos
                </Button>
                <Button
                  variant={filterType === "gasto" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("gasto")}
                >
                  Gastos
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fecha</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Categoría</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Monto</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-border/20 hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm">{new Date(transaction.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-sm font-medium">{transaction.client}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === "Ingreso"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{transaction.category}</td>
                    <td
                      className={`py-3 px-4 text-sm font-medium text-right ${
                        transaction.amount > 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      ${Math.abs(transaction.amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === "Completado"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron transacciones que coincidan con los filtros.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
