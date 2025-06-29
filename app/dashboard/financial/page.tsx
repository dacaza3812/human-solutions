"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FinancialCharts } from "@/components/financial-charts"
import { FinancialOverviewSection } from "../components/financial-overview-section"

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: "income" | "expense"
}

export default function FinancialPage() {
  const { profile, loading: authLoading } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    start: "2024-01-01",
    end: "2024-12-31",
  })

  useEffect(() => {
    if (!authLoading && profile?.account_type === "advisor") {
      fetchFinancialData()
    } else if (!authLoading && profile?.account_type !== "advisor") {
      setLoading(false) // Not an advisor, so no financial data to load
    }
  }, [profile, authLoading])

  const fetchFinancialData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Simulate fetching financial data for advisor
      setTransactions([
        { id: "t1", date: "2024-05-28", description: "Pago de cliente Juan Pérez", amount: 500, type: "income" },
        { id: "t2", date: "2024-05-27", description: "Gastos de oficina", amount: -120, type: "expense" },
        { id: "t3", date: "2024-05-26", description: "Pago de cliente Ana López", amount: 300, type: "income" },
        { id: "t4", date: "2024-05-25", description: "Suscripción a software legal", amount: -50, type: "expense" },
      ])
    } catch (err) {
      console.error("Failed to fetch financial data:", err)
      setError("Failed to load financial data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const netBalance = totalIncome + totalExpenses // Expenses are negative amounts

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
        <h3 className="text-xl font-semibold text-foreground mb-2">Acceso Denegado</h3>
        <p className="text-muted-foreground">Esta sección solo está disponible para asesores.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Vista Financiera</h1>
      <FinancialOverviewSection dateRange={dateRange} setDateRange={setDateRange} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gastos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-red-600">${Math.abs(totalExpenses).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Balance Neto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-4xl font-bold ${netBalance >= 0 ? "text-blue-600" : "text-red-600"}`}>
              ${netBalance.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gráficos Financieros</CardTitle>
        </CardHeader>
        <CardContent>
          <FinancialCharts />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transacciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay transacciones recientes.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.date}</TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${t.type === "income" ? "text-green-600" : "text-red-600"}`}
                    >
                      {t.type === "income" ? "+" : "-"}${Math.abs(t.amount).toFixed(2)}
                    </TableCell>
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
