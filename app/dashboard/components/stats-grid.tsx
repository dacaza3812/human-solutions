import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, Briefcase, MessageCircle } from "lucide-react"
import { createClient } from "@/lib/supabase-server"

export default async function StatsGrid() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <p>Por favor, inicia sesión para ver las estadísticas.</p>
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const isAdvisor = profile?.role === "advisor"

  // Fetch data for stats
  let totalCases = 0
  let activeCases = 0
  let totalClientsOrReferrals = 0
  let totalInquiries = 0

  if (isAdvisor) {
    // Advisor stats
    const { data: cases, error: casesError } = await supabase
      .from("cases")
      .select("id, status")
      .eq("advisor_id", user.id)

    if (cases) {
      totalCases = cases.length
      activeCases = cases.filter((c) => c.status === "open" || c.status === "in_progress").length
    }

    const { data: referrals, error: referralsError } = await supabase
      .from("referrals")
      .select("id")
      .eq("referrer_id", user.id)

    if (referrals) {
      totalClientsOrReferrals = referrals.length
    }

    const { data: inquiries, error: inquiriesError } = await supabase
      .from("inquiries")
      .select("id")
      .eq("status", "pending") // Only count pending inquiries for advisors

    if (inquiries) {
      totalInquiries = inquiries.length
    }
  } else {
    // Client stats
    const { data: cases, error: casesError } = await supabase
      .from("cases")
      .select("id, status")
      .eq("client_id", user.id)

    if (cases) {
      totalCases = cases.length
      activeCases = cases.filter((c) => c.status === "open" || c.status === "in_progress").length
    }

    // For clients, totalClientsOrReferrals could be their own active subscription status
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .single()

    if (subscription?.status === "active") {
      totalClientsOrReferrals = 1 // User is an active client
    }

    // Clients don't typically manage inquiries, so this might be 0 or not displayed
    totalInquiries = 0
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Casos</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCases}</div>
          <p className="text-xs text-muted-foreground">
            {activeCases} {activeCases === 1 ? "activo" : "activos"}
          </p>
        </CardContent>
      </Card>
      <Card className="bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {isAdvisor ? "Total de Referidos" : "Estado de Suscripción"}
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isAdvisor ? totalClientsOrReferrals : totalClientsOrReferrals === 1 ? "Activa" : "Inactiva"}
          </div>
          <p className="text-xs text-muted-foreground">{isAdvisor ? "clientes referidos" : "tu plan actual"}</p>
        </CardContent>
      </Card>
      <Card className="bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Consultas Pendientes</CardTitle>
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalInquiries}</div>
          <p className="text-xs text-muted-foreground">{isAdvisor ? "nuevas consultas" : "consultas enviadas"}</p>
        </CardContent>
      </Card>
      <Card className="bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ganancias Estimadas</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isAdvisor ? `$${(totalClientsOrReferrals * 25).toFixed(2)}` : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">{isAdvisor ? "por referidos activos" : "solo para asesores"}</p>
        </CardContent>
      </Card>
    </div>
  )
}
