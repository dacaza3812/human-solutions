"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Plus, DollarSign, Target, Award, Users, FileText, UserPlus, Calendar } from "lucide-react"
import { UserInfoCard } from "./components/user-info-card"
import { StatsGrid } from "./components/stats-grid"
import { RecentActivityCard } from "./components/recent-activity-card"
import { UpcomingAppointmentsCard } from "./components/upcoming-appointments-card"
import { formatDistanceToNowStrict } from "date-fns"
import { es } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
}

// Define tipos para los datos mock (these will be replaced by fetched data)
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

interface AdvisorClient {
  id: number
  name: string
  email: string
  phone: string
  avatar: string
  totalCases: number
  activeCases: number
  completedCases: number
  joinDate: string
  lastActivity: string
}

interface AdvisorCase {
  id: number
  clientName: string
  clientId: number
  title: string
  type: string
  status: string
  priority: string
  createdDate: string
  dueDate: string
  description: string
  progress: number
}

// New types for fetched data
interface ReferredProfile {
  id: string
  first_name: string | null
  last_name: string | null
  created_at: string
}

interface ReferralTransaction {
  id: string
  amount: number
  created_at: string
  referee_id: string
  profiles: { first_name: string | null; last_name: string | null } | null
}

interface Case {
  id: string
  title: string
  description: string | null
  status: "pendiente" | "en ejecución" | "completado"
  created_at: string
}

export default function DashboardPage() {
  const [activeView, setActiveView] = useState("overview")
  const [referralStats, setReferralStats] = useState({
    total_referrals: 0,
    active_referrals: 0,
    total_earnings: 0,
    monthly_earnings: 0,
  })
  const [referralCode, setReferralCode] = useState("")
  const [copySuccess, setCopySuccess] = useState(false)
  const [selectedCase, setSelectedCase] = useState<AdvisorCase | null>(null)
  const [selectedClient, setSelectedClient] = useState<AdvisorClient | null>(null)
  const [activeChat, setActiveChat] = useState<number | null>(null)
  const [clientFilter, setClientFilter] = useState("")
  const [caseFilter, setCaseFilter] = useState("all")
  const { user, profile, updateUserProfile, changePassword } = useAuth()

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [dateRange, setDateRange] = useState({
    start: "2024-01-01",
    end: "2024-12-31",
  })

  // State for Settings section
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [passwordChangeMessage, setPasswordChangeMessage] = useState("")
  const [passwordChangeError, setPasswordChangeError] = useState("")

  const [firstName, setFirstName] = useState(profile?.first_name || "")
  const [lastName, setLastName] = useState(profile?.last_name || "")
  const [profileUpdateMessage, setProfileUpdateMessage] = useState("")
  const [profileUpdateError, setProfileUpdateError] = useState("")

  const [newReferralCode, setNewReferralCode] = useState(profile?.referral_code || "")
  const [referralCodeUpdateMessage, setReferralCodeUpdateMessage] = useState("")
  const [referralCodeUpdateError, setReferralCodeUpdateError] = useState("")

  // States for fetched data
  const [recentActivityData, setRecentActivityData] = useState<
    {
      id: string
      type: string
      description: string
      time: string
      status: "success" | "completed" | "payment" | "scheduled"
    }[]
  >([])
  const [upcomingAppointmentsData, setUpcomingAppointmentsData] = useState<
    { title: string; time: string; description: string; colorClass: string }[]
  >([])
  const [loadingRecentActivity, setLoadingRecentActivity] = useState(true)
  const [loadingUpcomingAppointments, setLoadingUpcomingAppointments] = useState(true)

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "")
      setLastName(profile.last_name || "")
      setNewReferralCode(profile.referral_code || "")
    }
  }, [profile])

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

  // Mock data for advisor's clients
  const advisorClients: AdvisorClient[] = [
    {
      id: 1,
      name: "Juan Pérez",
      email: "juan@email.com",
      phone: "+52 123 456 7890",
      avatar: "/placeholder-user.jpg",
      totalCases: 3,
      activeCases: 2,
      completedCases: 1,
      joinDate: "2024-01-10",
      lastActivity: "2024-01-18",
    },
    {
      id: 2,
      name: "María López",
      email: "maria@email.com",
      phone: "+52 098 765 4321",
      avatar: "/placeholder-user.jpg",
      totalCases: 2,
      activeCases: 1,
      completedCases: 1,
      joinDate: "2024-01-05",
      lastActivity: "2024-01-17",
    },
    {
      id: 3,
      name: "Carlos Mendoza",
      email: "carlos@email.com",
      phone: "+52 555 123 4567",
      avatar: "/placeholder-user.jpg",
      totalCases: 4,
      activeCases: 3,
      completedCases: 1,
      joinDate: "2023-12-15",
      lastActivity: "2024-01-19",
    },
  ]

  // Mock data for advisor's cases
  const advisorCases: AdvisorCase[] = [
    {
      id: 1,
      clientName: "Juan Pérez",
      clientId: 1,
      title: "Asesoría Financiera Personal",
      type: "Asesoría Financiera",
      status: "En Progreso",
      priority: "Alta",
      createdDate: "2024-01-15",
      dueDate: "2024-02-15",
      description:
        "Planificación presupuestaria y estrategias de ahorro para mejorar la situación financiera familiar.",
      progress: 65,
    },
    {
      id: 2,
      clientName: "María López",
      clientId: 2,
      title: "Mediación Familiar",
      type: "Relaciones Familiares",
      status: "Programada",
      priority: "Media",
      createdDate: "2024-01-10",
      dueDate: "2024-01-30",
      description: "Resolución de conflictos familiares y mejora de la comunicación.",
      progress: 25,
    },
    {
      id: 3,
      clientName: "Carlos Mendoza",
      clientId: 3,
      title: "Consulta Legal",
      type: "Asesoría Legal",
      status: "En Revisión",
      priority: "Baja",
      createdDate: "2024-01-08",
      dueDate: "2024-01-25",
      description: "Consulta sobre derechos laborales y procedimientos legales.",
      progress: 80,
    },
  ]

  // Filter user's scheduled cases for quotes section
  const userScheduledCases = userCases.filter((case_item) => case_item.status !== "Completada")

  // Generate referral code on component mount
  useEffect(() => {
    if (profile && !referralCode) {
      const generateReferralCode = () => {
        const firstName = profile.first_name?.toLowerCase() || ""
        const lastName = profile.last_name?.toLowerCase() || ""
        const randomNum = Math.floor(Math.random() * 1000)
        return `${firstName}${lastName}${randomNum}`
      }
      setReferralCode(generateReferralCode())
    }
  }, [profile, referralCode])

  // Fetch referral stats for clients
  useEffect(() => {
    if (profile?.account_type === "client" && profile.id && referralCode) {
      fetchReferralStats()
    }
  }, [profile, referralCode])

  // New useEffect for fetching dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !profile) {
        setLoadingRecentActivity(false)
        setLoadingUpcomingAppointments(false)
        return
      }

      // Fetch Recent Activity
      setLoadingRecentActivity(true)
      try {
        const { data: referredUsers, error: referredUsersError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, created_at")
          .eq("referred_by", profile.referral_code)
          .order("created_at", { ascending: false })
          .limit(5)

        if (referredUsersError) throw referredUsersError

        const { data: referralPayments, error: referralPaymentsError } = await supabase
          .from("referral_transactions")
          .select("id, amount, created_at, referee_id, profiles!referee_id(first_name, last_name)") // Explicitly specify relationship
          .eq("referrer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5)

        if (referralPaymentsError) throw referralPaymentsError

        const rawCombinedActivity = [
          ...referredUsers.map((item) => ({ ...item, type: "referral", raw_created_at: item.created_at })),
          ...referralPayments.map((item) => ({ ...item, type: "payment", raw_created_at: item.created_at })),
        ]

        rawCombinedActivity.sort((a, b) => new Date(b.raw_created_at).getTime() - new Date(a.raw_created_at).getTime())

        const formattedCombinedActivity = rawCombinedActivity
          .map((item) => {
            if (item.type === "referral") {
              const refUser = item as ReferredProfile & { raw_created_at: string }
              return {
                id: refUser.id,
                type: "Nuevo Referido",
                description: `${refUser.first_name || ""} ${refUser.last_name || ""} se ha registrado.`,
                time: formatDistanceToNowStrict(new Date(refUser.raw_created_at), { addSuffix: true, locale: es }),
                status: "success" as const,
              }
            } else {
              const payment = item as ReferralTransaction & { raw_created_at: string }
              return {
                id: payment.id,
                type: "Pago de Referido",
                description: `Pago de $${payment.amount} USD de ${payment.profiles?.first_name || ""} ${payment.profiles?.last_name || ""}.`,
                time: formatDistanceToNowStrict(new Date(payment.raw_created_at), { addSuffix: true, locale: es }),
                status: "payment" as const,
              }
            }
          })
          .slice(0, 5) // Limit to 5 most recent activities

        setRecentActivityData(formattedCombinedActivity)
      } catch (error) {
        console.error("Error fetching recent activity:", error)
        setRecentActivityData([])
      } finally {
        setLoadingRecentActivity(false)
      }

      // Fetch Upcoming Appointments (Inquiries/Cases)
      setLoadingUpcomingAppointments(true)
      try {
        const { data: casesData, error: casesError } = await supabase
          .from("cases")
          .select("id, title, description, status, created_at")
          .eq("user_id", user.id)
          .in("status", ["pendiente", "en ejecución"])
          .order("created_at", { ascending: false })
          .limit(5)

        if (casesError) throw casesError

        const formattedAppointments = casesData.map((caseItem: Case) => {
          let colorClass = "gray"
          if (caseItem.status === "pendiente") {
            colorClass = "orange"
          } else if (caseItem.status === "en ejecución") {
            colorClass = "blue"
          }

          return {
            title: caseItem.title,
            time: new Date(caseItem.created_at).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            description: caseItem.description || "Sin descripción",
            colorClass: colorClass,
          }
        })
        setUpcomingAppointmentsData(formattedAppointments)
      } catch (error) {
        console.error("Error fetching upcoming appointments:", error)
        setUpcomingAppointmentsData([])
      } finally {
        setLoadingUpcomingAppointments(false)
      }
    }

    fetchDashboardData()
  }, [user, profile])

  const fetchReferralStats = async () => {
    try {
      const { data, error } = await supabase.rpc("get_referral_stats4", {
        user_referral_code: referralCode,
      })

      if (error) {
        console.error("Error fetching referral stats:", error)
        return
      }

      if (data && data.length > 0) {
        const stats = data[0]
        setReferralStats({
          total_referrals: stats.total_referrals || 0,
          active_referrals: stats.active_referrals || 0,
          total_earnings: stats.total_earnings || 0,
          monthly_earnings: stats.monthly_earnings || 0,
        })
      }
    } catch (error) {
      console.error("Error fetching referral stats:", error)
    }
  }

  const copyReferralLink = async () => {
    const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/register?ref=${referralCode}`
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Error copying to clipboard:", err)
    }
  }

  const openChatForCase = (caseId: number) => {
    setActiveChat(caseId)
    setActiveView("messages")
  }

  const filteredClients = advisorClients.filter(
    (client) =>
      client.name.toLowerCase().includes(clientFilter.toLowerCase()) ||
      client.email.toLowerCase().includes(clientFilter.toLowerCase()),
  )

  const filteredCases = advisorCases.filter((case_item) => {
    if (caseFilter === "all") return true
    return case_item.status.toLowerCase().includes(caseFilter.toLowerCase())
  })

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
      value: referralStats.total_referrals.toString(),
      change: `+${referralStats.monthly_earnings > 0 ? Math.floor(referralStats.monthly_earnings / 25) : 0}`,
      icon: UserPlus,
      color: "text-blue-400",
    },
    {
      title: "Ganancias Totales",
      value: `$${referralStats.total_earnings}`,
      change: `+$${referralStats.monthly_earnings}`,
      icon: DollarSign,
      color: "text-purple-400",
    },
    {
      title: "Próximas Citas",
      value: upcomingAppointmentsData.length.toString(), // Use fetched data length
      change: "Esta semana",
      icon: Calendar,
      color: "text-orange-400",
    },
  ]

  // Determine which set of stats to pass
  const displayStats = profile?.account_type === "advisor" ? advisorStats : clientStats

  // Handlers for Settings section
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordChangeMessage("")
    setPasswordChangeError("")

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError("Las nuevas contraseñas no coinciden.")
      return
    }
    if (newPassword.length < 6) {
      setPasswordChangeError("La nueva contraseña debe tener al menos 6 caracteres.")
      return
    }

    const { error } = await changePassword(newPassword)

    if (error) {
      setPasswordChangeError(`Error al cambiar contraseña: ${error.message}`)
    } else {
      setPasswordChangeMessage("Contraseña cambiada exitosamente.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileUpdateMessage("")
    setProfileUpdateError("")

    if (!firstName.trim() || !lastName.trim()) {
      setProfileUpdateError("El nombre y apellido no pueden estar vacíos.")
      return
    }

    const { error } = await updateUserProfile({ first_name: firstName, last_name: lastName })

    if (error) {
      setProfileUpdateError(`Error al actualizar perfil: ${error.message}`)
    } else {
      setProfileUpdateMessage("Información de perfil actualizada exitosamente.")
    }
  }

  const handleReferralCodeUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setReferralCodeUpdateMessage("")
    setReferralCodeUpdateError("")

    if (!newReferralCode.trim()) {
      setReferralCodeUpdateError("El código de referido no puede estar vacío.")
      return
    }
    if (!/^[a-zA-Z0-9]+$/.test(newReferralCode)) {
      setReferralCodeUpdateError("El código de referido solo puede contener letras y números.")
      return
    }

    const { error } = await updateUserProfile({ referral_code: newReferralCode })

    if (error) {
      setReferralCodeUpdateError(`Error al actualizar código de referido: ${error.message}`)
    } else {
      setReferralCodeUpdateMessage("Código de referido actualizado exitosamente.")
      setReferralCode(newReferralCode)
    }
  }

  return (
    <div className="p-6">
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

        {/* Recent Activity & Upcoming Appointments */}
        <div className="grid lg:grid-cols-2 gap-6">
          {loadingRecentActivity ? (
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </CardContent>
            </Card>
          ) : (
            <RecentActivityCard recentActivity={recentActivityData} />
          )}
          {loadingUpcomingAppointments ? (
            <Card className="border-border/40">
              <CardHeader>
                <CardTitle>Próximas Citas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </CardContent>
            </Card>
          ) : (
            <UpcomingAppointmentsCard upcomingAppointments={upcomingAppointmentsData} />
          )}
        </div>
      </div>
    </div>
  )
}
