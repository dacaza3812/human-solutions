import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import FinancialCharts from "@/components/financial-charts"
import { createClient } from "@/lib/supabase-server"

export default async function FinancialOverviewSection() {
  const supabase = createClient()
  // In a real app, you'd fetch financial data for the user/advisor
  const { data: transactions, error } = await supabase.from("transactions").select("*").limit(5)

  if (error) {
    console.error("Error fetching transactions:", error)
    return <p>Error loading financial data.</p>
  }

  const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
  const monthlyChange = 12.5 // Example data

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Resumen Financiero</CardTitle>
        <DollarSign className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">${totalRevenue.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground flex items-center">
          {monthlyChange >= 0 ? (
            <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
          )}
          {monthlyChange}% desde el mes pasado
        </p>
        <div className="h-[200px] mt-4">
          <FinancialCharts />
        </div>
      </CardContent>
    </Card>
  )
}
