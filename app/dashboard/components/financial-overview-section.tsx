import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import { createClient } from "@/lib/supabase-server"

export default async function FinancialOverviewSection() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <p>Por favor, inicia sesión para ver tu resumen financiero.</p>
  }

  // Fetch user's subscription status
  const { data: subscription, error: subError } = await supabase
    .from("user_subscriptions")
    .select("status, plan_id")
    .eq("user_id", user.id)
    .single()

  // Fetch referral data for advisors
  let totalReferrals = 0
  let estimatedEarnings = 0

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const isAdvisor = profile?.role === "advisor"

  if (isAdvisor) {
    const { data: referrals, error: referralError } = await supabase
      .from("referrals")
      .select("id")
      .eq("referrer_id", user.id)

    if (referralError) {
      console.error("Error fetching referrals:", referralError)
    } else {
      totalReferrals = referrals.length
      // Simple calculation: $25 per direct referral
      estimatedEarnings = totalReferrals * 25
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Resumen Financiero</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isAdvisor ? (
          <>
            <div className="text-2xl font-bold">${estimatedEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Ingresos estimados por referidos</p>
            <div className="flex items-center text-sm mt-2">
              <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
              <span>{totalReferrals} referidos activos</span>
            </div>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{subscription?.status === "active" ? "Activa" : "Inactiva"}</div>
            <p className="text-xs text-muted-foreground">Estado de tu suscripción</p>
            {subscription?.status === "active" ? (
              <div className="flex items-center text-sm mt-2">
                <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                <span>
                  Plan{" "}
                  {subscription.plan_id === 1 ? "Standard" : subscription.plan_id === 2 ? "Premium" : "Collaborative"}
                </span>
              </div>
            ) : (
              <div className="flex items-center text-sm mt-2">
                <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
                <span>Considera suscribirte para acceso completo</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
