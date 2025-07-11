import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, TrendingUp, Clock } from "lucide-react"
import { getReferralStats4 } from "@/scripts/get-referral-stats" // Assuming this is a server action or function
import { getReferralTransactions } from "@/actions/referrals"
import { ReferralTransactionsTable } from "./referral-transactions-table"

interface FinancialOverviewSectionProps {
  advisorId?: string
}

export async function FinancialOverviewSection({ advisorId }: FinancialOverviewSectionProps) {
  let totalReferrals = 0
  let activeReferrals = 0
  let totalEarnings = 0
  let monthlyEarnings = 0
  let referralTransactions = []

  if (advisorId) {
    // Fetch referral stats for advisors
    const { data: stats, error: statsError } = await getReferralStats4(advisorId)
    if (stats && stats.length > 0) {
      totalReferrals = stats[0].total_referrals || 0
      activeReferrals = stats[0].active_referrals || 0
      totalEarnings = stats[0].total_earnings || 0
      monthlyEarnings = stats[0].monthly_earnings || 0
    } else if (statsError) {
      console.error("Error fetching referral stats:", statsError)
    }

    // Fetch referral transactions for advisors
    referralTransactions = await getReferralTransactions(advisorId)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ganancias Totales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Acumulado de todas las comisiones</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ganancias del Mes</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${monthlyEarnings.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Comisiones en el mes actual</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Referidos Totales</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalReferrals}</div>
          <p className="text-xs text-muted-foreground">Usuarios registrados con tu código</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Referidos Activos</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeReferrals}</div>
          <p className="text-xs text-muted-foreground">Referidos que han realizado un pago</p>
        </CardContent>
      </Card>

      {advisorId && (
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Transacciones de Referidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ReferralTransactionsTable transactions={referralTransactions} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
