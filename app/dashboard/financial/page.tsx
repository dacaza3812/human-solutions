"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { XCircle, FileText } from "lucide-react"
import { FinancialCharts } from "@/components/financial-charts" // Assuming this component exists

interface Transaction {
  id: string
  description: string
  type: "income" | "expense"
  amount: number
  date: string
}

export default function FinancialPage() {
  const { profile, loading } = useAuth()
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    pendingPayments: 0,
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingFinancialData, setLoadingFinancialData] = useState(true)

  useEffect(() => {
    // Simulate fetching financial data for advisor
    setLoadingFinancialData(true)
    setTimeout(() => {
      const mockTransactions: Transaction[] = [
        { id: "t1", description: "Caso Divorcio - Honorarios", type: "income", amount: 1500, date: "2023-10-28" },
        { id: "t2", description: "Alquiler de oficina", type: "expense", amount: 800, date: "2023-10-25" },
        { id: "t3", description: "Caso Accidente - Anticipo", type: "income", amount: 500, date: "2023-10-20" },
        { id: "t4", description: "Suministros de oficina", type: "expense", amount: 120, date: "2023-10-18" },
        { id: "t5", description: "Caso Herencia - Honorarios", type: "income", amount: 2000, date: "2023-10-15" },
      ]

      const totalRevenue = mockTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
      const totalExpenses = mockTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
      const netProfit = totalRevenue - totalExpenses
      const pendingPayments = 750 // Example pending amount

      setFinancialData({
        totalRevenue,
        totalExpenses,
        netProfit,
        pendingPayments,
      })
      setTransactions(mockTransactions)
      setLoadingFinancialData(false)
    }, 1000)
  }, [profile])

  if (loading || loadingFinancialData) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Cargando...</h3>
        <p className="text-muted-foreground">Cargando tus datos financieros.</p>
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
          <h2 className="text-3xl font-bold text-foreground">Resumen Financiero</h2>
          <p className="text-muted-foreground">Visualiza tus ingresos, gastos y ganancias.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialData.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% del mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialData.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">-5.2% del mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Neta</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialData.netProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15.0% del mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialData.pendingPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">4 pagos pendientes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gráficos Financieros</CardTitle>
          <CardDescription>Visualización de ingresos y gastos a lo largo del tiempo.</CardDescription>
        </CardHeader>
        <CardContent>
          <FinancialCharts />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transacciones Recientes</CardTitle>
          <CardDescription>Un listado de tus últimas transacciones.</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-muted-foreground">No hay transacciones para mostrar.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead className="text-right">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.description}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === "income" ? "default" : "secondary"}>
                        {transaction.type === "income" ? "Ingreso" : "Gasto"}
                      </Badge>
                    </TableCell>
                    <TableCell className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                      {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{new Date(transaction.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
