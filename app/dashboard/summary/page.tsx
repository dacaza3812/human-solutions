"use client"
import { Button } from "@/components/ui/button"
import { Plus, Users, Target, DollarSign, Award, FileText, UserPlus, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { UserInfoCard } from "../components/user-info-card"
import { StatsGrid } from "../components/stats-grid"
import { RecentActivityCard } from "../components/recent-activity-card"
import { UpcomingAppointmentsCard } from "../components/upcoming-appointments-card"

// Define un tipo para el perfil de usuario si no existe
interface UserProfile {
  id: string
  first_name?: string | null
  last_name?: string | null
  account_type?: string | null
  phone?: string | null
  created_at?: string | null
  referral_code?: string | null
  stripe_customer_id?: string | null
  // Añade cualquier otro campo de perfil que uses
}

// Define tipos para los datos mock
interface ClientCase {
  id: number
  title: string
  type: string
  status: string
  advisor: string
  advisorAvatar: string
  description: string
  createdDate: string
  nextAppointment: string | null
  progress: number
}

export default function SummaryPage() {
  const { user, profile } = useAuth()

  // Mock data for current user's cases (client view)
  const userCases: ClientCase[] = [
    {
      id: 1,
      title: "Asesoría Financiera Personal",
      type: "Asesoría Financiera",
      status: "En Progreso",
      advisor: "Dr. María González",
      advisorAvatar: "/placeholder-user.jpg",
      description:
        "Planificación presupuestaria y estrategias de ahorro para mejorar la situación financiera familiar.",
      createdDate: "2024-01-15",
      nextAppointment: "2024-01-25 10:00 AM",
      progress: 65,
    },
    {
      id: 2,
      title: "Mediación Familiar",
      type: "Relaciones Familiares",
      status: "Programada",
      advisor: "Lic. Carlos Rodríguez",
      advisorAvatar: "/placeholder-user.jpg",
      description: "Resolución de conflictos familiares y mejora de la comunicación entre miembros de la familia.",
      createdDate: "2024-01-10",
      nextAppointment: "2024-01-20 2:30 PM",
      progress: 25,
    },
    {
      id: 3,
      title: "Consulta Legal",
      type: "Asesoría Legal",
      status: "Completada",
      advisor: "Abg. Ana Martínez",
      advisorAvatar: "/placeholder-user.jpg",
      description: "Consulta sobre derechos laborales y procedimientos legales.",
      createdDate: "2023-12-20",
      nextAppointment: null,
      progress: 100,
    },
  ]

  // Filter user's scheduled cases for quotes section
  const userScheduledCases = userCases.filter((case_item) => case_item.status !== "Completada")

  // Define stats for advisor
  const advisorStats = [
    {
      title: "Clientes Activos",
      value: "124",
      change: "+12%",
      icon: Users,
      color: "text-emerald-400",
    },
    {
      title: "Casos Resueltos",
      value: "89",
      change: "+8%",
      icon: Target,
      color: "text-blue-400",
    },
    {
      title: "Ingresos Mensuales",
      value: "$12,450",
      change: "+23%",
      icon: DollarSign,
      color: "text-purple-400",
    },
    {
      title: "Satisfacción",
      value: "98%",
      change: "+2%",
      icon: Award,
      color: "text-orange-400",
    },
  ]

  // Define stats for client
  const clientStats = [
    {
      title: "Casos Activos",
      value: userCases.filter((c) => c.status !== "Completada").length.toString(),
      change: "+1",
      icon: FileText,
      color: "text-emerald-400",
    },
    {
      title: "Referidos Totales",
      value: "0", // This will be updated by the layout's referralStats
      change: "+0", // This will be updated by the layout's referralStats
      icon: UserPlus,
      color: "text-blue-400",
    },
    {
      title: "Ganancias Totales",
      value: "$0", // This will be updated by the layout's referralStats
      change: "+$0", // This will be updated by the layout's referralStats
      icon: DollarSign,
      color: "text-purple-400",
    },
    {
      title: "Próximas Citas",
      value: userScheduledCases.length.toString(),
      change: "Esta semana",
      icon: Calendar,
      color: "text-orange-400",
    },
  ]

  // Determine which set of stats to pass
  const displayStats = profile?.account_type === "advisor" ? advisorStats : clientStats

  const recentActivity = [
    {
      id: 1,
      type: "Nuevo Cliente",
      description: "María González se registró para asesoría financiera",
      time: "Hace 2 horas",
      status: "success",
    },
    {
      id: 2,
      type: "Caso Completado",
      description: "Caso de mediación familiar #1234 resuelto exitosamente",
      time: "Hace 4 horas",
      status: "completed",
    },
    {
      id: 3,
      type: "Pago Recibido",
      description: "Pago de $150 USD recibido de Carlos Rodríguez",
      time: "Hace 6 horas",
      status: "payment",
    },
    {
      id: 4,
      type: "Consulta Programada",
      description: "Nueva consulta programada para mañana a las 10:00 AM",
      time: "Hace 1 día",
      status: "scheduled",
    },
  ]

  // Data for UpcomingAppointmentsCard
  const upcomingAppointmentsData = [
    {
      title: "Consulta Financiera",
      time: "10:00 AM",
      description: "Ana Martínez - Planificación presupuestaria",
      colorClass: "emerald",
    },
    {
      title: "Mediación Familiar",
      time: "2:30 PM",
      description: "Familia Rodríguez - Resolución de conflictos",
      colorClass: "blue",
    },
    {
      title: "Consulta Profesional",
      time: "4:00 PM",
      description: "Luis Fernández - Asesoría empresarial",
      colorClass: "purple",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Bienvenido, {profile?.first_name}</h2>
          <p className="text-muted-foreground">Aquí tienes un resumen de tu actividad</p>
        </div>
        {profile?.account_type === "advisor" && (
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Caso
          </Button>
        )}
      </div>

      {/* User Info Card */}
      <UserInfoCard user={user} profile={profile} />

      {/* Stats Grid */}
      <StatsGrid stats={displayStats} />

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <RecentActivityCard recentActivity={recentActivity} />

        <UpcomingAppointmentsCard upcomingAppointments={upcomingAppointmentsData} />
      </div>
    </div>
  )
}
