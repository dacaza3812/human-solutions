"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context" // Re-imported useAuth
import { supabase } from "@/lib/supabase" // Re-imported supabase
import { Plus, DollarSign, Target, Award, Users, FileText, UserPlus, Calendar } from "lucide-react"
import { UserInfoCard } from "./components/user-info-card"
import { StatsGrid } from "./components/stats-grid"
import { RecentActivityCard } from "./components/recent-activity-card"
import { UpcomingAppointmentsCard } from "./components/upcoming-appointments-card"

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

export default function DashboardPage() {
  const [activeView, setActiveView] = useState("overview")
  const [referralStats, setReferralStats] = useState({
    // Re-introduced referralStats state
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
  const { user, profile, updateUserProfile, changePassword } = useAuth() // Re-introduced useAuth hook

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

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "")
      setLastName(profile.last_name || "")
      setNewReferralCode(profile.referral_code || "")
    }
  }, [profile]) // Dependency on profile to update when profile data is available

  const fetchReferralStats = async () => {
        try {
            // Use the new SQL function to get referral stats
            const { data, error } = await supabase.rpc("get_referral_stats4", {
                user_referral_code: profile?.referral_code || referralCode,
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
      // Added referralCode dependency
      fetchReferralStats()
    }
  }, [profile, referralCode]) // Added referralCode to dependencies

  

  const copyReferralLink = async () => {
    const referralLink = `https://foxlawyer.vercel.app/register?ref=${referralCode}`
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

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <RecentActivityCard recentActivity={recentActivity} />
          <UpcomingAppointmentsCard upcomingAppointments={upcomingAppointmentsData} />
        </div>
      </div>
    </div>
  )
}
