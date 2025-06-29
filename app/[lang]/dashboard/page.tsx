import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UserInfoCard } from "@/app/dashboard/components/user-info-card"
import { StatsGrid } from "@/app/dashboard/components/stats-grid"
import { RecentActivityCard } from "@/app/dashboard/components/recent-activity-card"
import { UpcomingAppointmentsCard } from "@/app/dashboard/components/upcoming-appointments-card"
import { ClientCasesSection } from "@/app/dashboard/components/client-cases-section"
import { AdvisorCasesSection } from "@/app/dashboard/components/advisor-cases-section"
import { AdvisorClientsSection } from "@/app/dashboard/components/advisor-clients-section"
import { MessagesSection } from "@/app/dashboard/components/messages-section"
import { QuotesSection } from "@/app/dashboard/components/quotes-section"
import { FinancialOverviewSection } from "@/app/dashboard/components/financial-overview-section"
import { ReferralsSection } from "@/app/dashboard/components/referrals-section"
import { SettingsSection } from "@/app/dashboard/components/settings-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function DashboardPage({ params: { lang } }: { params: { lang: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect(`/${lang}/login`)
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profileError || !profile) {
    console.error("Error fetching profile:", profileError)
    // Handle error, maybe redirect to an error page or show a message
    return <div>Error loading profile.</div>
  }

  const isAdvisor = profile.account_type === "advisor"

  // Fetch data for advisor
  let advisorClients: any[] = []
  let advisorCases: any[] = []
  let referralStats: any = null

  if (isAdvisor) {
    const { data: clientsData, error: clientsError } = await supabase
      .from("profiles")
      .select("*")
      .eq("referred_by", profile.referral_code)

    if (clientsError) {
      console.error("Error fetching advisor clients:", clientsError)
    } else {
      advisorClients = clientsData || []
    }

    const { data: casesData, error: casesError } = await supabase
      .from("cases")
      .select("*")
      .eq("assigned_advisor_id", user.id)

    if (casesError) {
      console.error("Error fetching advisor cases:", casesError)
    } else {
      advisorCases = casesData || []
    }

    const { data: statsData, error: statsError } = await supabase.rpc("get_referral_stats", {
      p_referrer_id: user.id,
    })

    if (statsError) {
      console.error("Error fetching referral stats:", statsError)
    } else {
      referralStats = statsData
    }
  }

  // Fetch data for client
  let userCases: any[] = []
  if (!isAdvisor) {
    const { data: casesData, error: casesError } = await supabase.from("cases").select("*").eq("client_id", user.id)

    if (casesError) {
      console.error("Error fetching user cases:", casesError)
    } else {
      userCases = casesData || []
    }
  }

  // Dummy data for upcoming appointments (can be replaced with real data)
  const upcomingAppointments = [
    {
      title: "Consulta Inicial",
      time: "10:00 AM",
      description: "Reunión con el cliente Juan Pérez para discutir el caso de divorcio.",
      colorClass: "bg-blue-100 text-blue-800",
    },
    {
      title: "Audiencia Judicial",
      time: "02:30 PM",
      description: "Audiencia en el juzgado de lo civil, caso #12345.",
      colorClass: "bg-red-100 text-red-800",
    },
    {
      title: "Reunión de Equipo",
      time: "04:00 PM",
      description: "Revisión semanal de casos pendientes con el equipo legal.",
      colorClass: "bg-green-100 text-green-800",
    },
  ]

  // Stats for advisor
  const advisorStats = [
    {
      title: "Clientes Referidos",
      value: referralStats?.total_referrals || 0,
      description: "Total de clientes que has referido.",
    },
    {
      title: "Casos Asignados",
      value: advisorCases.length,
      description: "Número de casos activos bajo tu gestión.",
    },
    {
      title: "Ganancias Estimadas",
      value: `$${(referralStats?.total_earnings || 0).toFixed(2)}`,
      description: "Ganancias totales generadas por tus referidos.",
    },
    {
      title: "Clientes Activos",
      value: advisorClients.length,
      description: "Clientes activos que te han sido asignados.",
    },
  ]

  // Stats for client
  const clientStats = [
    {
      title: "Casos Activos",
      value: userCases.filter((c) => c.status === "active").length,
      description: "Número de casos legales activos.",
    },
    {
      title: "Casos Completados",
      value: userCases.filter((c) => c.status === "completed").length,
      description: "Casos legales que han sido cerrados.",
    },
    {
      title: "Próximas Citas",
      value: upcomingAppointments.length,
      description: "Citas programadas con tu asesor.",
    },
    {
      title: "Documentos Compartidos",
      value: 12, // Placeholder
      description: "Documentos relevantes compartidos en tus casos.",
    },
  ]

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <UserInfoCard profile={profile} />
              <StatsGrid stats={isAdvisor ? advisorStats : clientStats} />
            </div>
            <Tabs defaultValue="overview">
              <div className="flex items-center">
                <TabsList>
                  <TabsTrigger value="overview">Resumen</TabsTrigger>
                  {isAdvisor && <TabsTrigger value="clients">Clientes</TabsTrigger>}
                  <TabsTrigger value="cases">Casos</TabsTrigger>
                  <TabsTrigger value="messages">Mensajes</TabsTrigger>
                  <TabsTrigger value="quotes">Presupuestos</TabsTrigger>
                  <TabsTrigger value="financial">Financiero</TabsTrigger>
                  {isAdvisor && <TabsTrigger value="referrals">Referidos</TabsTrigger>}
                  <TabsTrigger value="settings">Configuración</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="overview">
                <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-2">
                  <RecentActivityCard />
                  <UpcomingAppointmentsCard upcomingAppointments={upcomingAppointments} />
                </div>
              </TabsContent>
              <TabsContent value="clients">
                {isAdvisor && <AdvisorClientsSection advisorClients={advisorClients} />}
              </TabsContent>
              <TabsContent value="cases">
                {isAdvisor ? (
                  <AdvisorCasesSection advisorCases={advisorCases} />
                ) : (
                  <ClientCasesSection userCases={userCases} />
                )}
              </TabsContent>
              <TabsContent value="messages">
                <MessagesSection />
              </TabsContent>
              <TabsContent value="quotes">
                <QuotesSection />
              </TabsContent>
              <TabsContent value="financial">
                <FinancialOverviewSection />
              </TabsContent>
              <TabsContent value="referrals">
                {isAdvisor && <ReferralsSection referralStats={referralStats} />}
              </TabsContent>
              <TabsContent value="settings">
                <SettingsSection profile={profile} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
