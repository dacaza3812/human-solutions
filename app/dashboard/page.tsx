"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, DollarSign, Users, FileText, ArrowUpRight, Plus, ClipboardList, BarChart } from "lucide-react"
import { UserInfoCard } from "@/app/dashboard/components/user-info-card"
import { RecentActivityCard } from "@/app/dashboard/components/recent-activity-card"
import { UpcomingAppointmentsCard } from "@/app/dashboard/components/upcoming-appointments-card"
import { StatsGrid } from "@/app/dashboard/components/stats-grid"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import NewCaseForm from "@/components/new-case-form"

export default function DashboardPage() {
  const { user, profile, updateUserProfile, changePassword } = useAuth()
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referralStats, setReferralStats] = useState({
    total_referred: 0,
    active_referred: 0,
    earnings: 0,
  })
  const [dataLoading, setDataLoading] = useState(true) // New state for data loading

  useEffect(() => {
    const generateReferralCode = async () => {
      if (profile && !profile.referral_code) {
        const newCode = Math.random().toString(36).substring(2, 10).toUpperCase()
        const { error } = await updateUserProfile({ referral_code: newCode })
        if (!error) {
          setReferralCode(newCode)
        } else {
          console.error("Error generating referral code:", error)
        }
      } else if (profile?.referral_code) {
        setReferralCode(profile.referral_code)
      }
    }

    const fetchReferralStats = async () => {
      if (profile?.account_type === "advisor" && profile?.referral_code) {
        setDataLoading(true) // Set data loading true before fetch
        try {
          const { data, error } = await supabase.rpc("get_referral_stats", {
            p_referrer_code: profile.referral_code,
          })

          if (error) {
            console.error("Error fetching referral stats:", error)
            setReferralStats({ total_referred: 0, active_referred: 0, earnings: 0 })
          } else {
            setReferralStats(data || { total_referred: 0, active_referred: 0, earnings: 0 })
          }
        } catch (err) {
          console.error("Unexpected error fetching referral stats:", err)
          setReferralStats({ total_referred: 0, active_referred: 0, earnings: 0 })
        } finally {
          setDataLoading(false) // Set data loading false after fetch
        }
      } else {
        setDataLoading(false) // If not an advisor or no referral code, set loading false
      }
    }

    if (profile) {
      generateReferralCode()
      fetchReferralStats()
    }
  }, [profile, updateUserProfile])

  const clientStats = [
    {
      id: "total_cases",
      label: "Casos Totales",
      value: "12",
      icon: FileText,
      description: "Casos gestionados hasta la fecha",
    },
    {
      id: "active_cases",
      label: "Casos Activos",
      value: "3",
      icon: ClipboardList,
      description: "Casos actualmente en progreso",
    },
    {
      id: "upcoming_appointments",
      label: "Próximas Citas",
      value: "2",
      icon: CalendarIcon,
      description: "Citas programadas para esta semana",
    },
    {
      id: "referral_earnings",
      label: "Ganancias por Referidos",
      value: `$${referralStats.earnings.toFixed(2)}`,
      icon: DollarSign,
      description: "Total ganado por referidos",
    },
    {
      id: "total_referred",
      label: "Referidos Totales",
      value: referralStats.total_referred.toString(),
      icon: Users,
      description: "Usuarios registrados con tu código",
    },
    {
      id: "active_referred",
      label: "Referidos Activos",
      value: referralStats.active_referred.toString(),
      icon: ArrowUpRight,
      description: "Referidos con suscripción activa",
    },
  ]

  const advisorStats = [
    {
      id: "total_clients",
      label: "Clientes Totales",
      value: "45",
      icon: Users,
      description: "Clientes activos en tu cartera",
    },
    {
      id: "active_cases",
      label: "Casos Activos",
      value: "15",
      icon: ClipboardList,
      description: "Casos actualmente en progreso",
    },
    {
      id: "upcoming_appointments",
      label: "Próximas Citas",
      value: "7",
      icon: CalendarIcon,
      description: "Citas programadas para esta semana",
    },
    {
      id: "monthly_earnings",
      label: "Ganancias Mensuales",
      value: "$5,200",
      icon: DollarSign,
      description: "Ingresos estimados este mes",
    },
    {
      id: "new_referrals",
      label: "Nuevos Referidos",
      value: "8",
      icon: ArrowUpRight,
      description: "Nuevos usuarios referidos este mes",
    },
    {
      id: "consultation_hours",
      label: "Horas de Consulta",
      value: "60",
      icon: BarChart,
      description: "Horas de consulta este mes",
    },
  ]

  const statsToDisplay = profile?.account_type === "advisor" ? advisorStats : clientStats

  if (!user || !profile || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="text-muted-foreground">Cargando datos del usuario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Bienvenido, {profile?.first_name || user?.email || "Usuario"}!
        </h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Caso
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Caso</DialogTitle>
            </DialogHeader>
            <NewCaseForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <UserInfoCard
          user={user}
          profile={profile}
          referralCode={referralCode}
          updateUserProfile={updateUserProfile}
          changePassword={changePassword}
        />
        <RecentActivityCard />
        <UpcomingAppointmentsCard />
      </div>

      <StatsGrid stats={statsToDisplay} />

      <div className="mt-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="cases">Casos</TabsTrigger>
            <TabsTrigger value="appointments">Citas</TabsTrigger>
            <TabsTrigger value="messages">Mensajes</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
            {profile?.account_type === "advisor" && <TabsTrigger value="analytics">Análisis</TabsTrigger>}
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumen General</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Contenido del resumen general.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="cases" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Casos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Contenido de gestión de casos.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="appointments" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Próximas Citas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Contenido de próximas citas.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="messages" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Mensajes Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Contenido de mensajes recientes.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="settings" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de la Cuenta</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Contenido de configuración de la cuenta.</p>
              </CardContent>
            </Card>
          </TabsContent>
          {profile?.account_type === "advisor" && (
            <TabsContent value="analytics" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Rendimiento</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Contenido de análisis de rendimiento.</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
