"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { UserInfoCard } from "./components/user-info-card"
import { RecentActivityCard } from "./components/recent-activity-card"
import { UpcomingAppointmentsCard } from "./components/upcoming-appointments-card"
import { StatsGrid } from "./components/stats-grid"
import { ClientCasesSection } from "./components/client-cases-section"
import { AdvisorCasesSection } from "./components/advisor-cases-section"
import { AdvisorClientsSection } from "./components/advisor-clients-section"
import { MessagesSection } from "./components/messages-section"
import { QuotesSection } from "./components/quotes-section"
import { FinancialOverviewSection } from "./components/financial-overview-section"
import { ReferralsSection } from "./components/referrals-section"
import { SubscriptionsSection } from "./components/subscriptions-section"
import { SettingsSection } from "./components/settings-section"

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

export default async function DashboardPage() {
  const supabase = getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("role, username, avatar_url")
    .eq("id", user.id)
    .single()

  if (profileError || !profileData) {
    console.error("Error fetching profile:", profileError)
    // Handle error, maybe redirect to a profile setup page or show a generic error
    redirect("/login") // Or a more appropriate error page
  }

  const userRole = profileData.role
  const username = profileData.username || user.email
  const avatarUrl = profileData.avatar_url || "/placeholder-user.jpg"

  const [activeView, setActiveView] = useState("overview")
  const [referralStats, setReferralStats] = useState({
    total_referrals: 0,
    active_referrals: 0,
    total_earnings: 0,
    monthly_earnings: 0,
  })
  const [referralCode, setReferralCode] = useState("")
  const [copySuccess, setCopySuccess] = useState(false)
  const [selectedCase, setSelectedCase] = useState(null)
  const [selectedClient, setSelectedClient] = useState(null)
  const [activeChat, setActiveChat] = useState(null)
  const [clientFilter, setClientFilter] = useState("")
  const [caseFilter, setCaseFilter] = useState("all")
  const { updateUserProfile, changePassword } = useAuth()

  const [selectedDate, setSelectedDate] = useState(new Date())
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

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [profileUpdateMessage, setProfileUpdateMessage] = useState("")
  const [profileUpdateError, setProfileUpdateError] = useState("")

  const [newReferralCode, setNewReferralCode] = useState("")
  const [referralCodeUpdateMessage, setReferralCodeUpdateMessage] = useState("")
  const [referralCodeUpdateError, setReferralCodeUpdateError] = useState("")

  useEffect(() => {
    setFirstName(profileData.username || "")
    setLastName("")
    setNewReferralCode("")
  }, [profileData])

  // Mock data for current user's cases (client view)
  const userCases = [
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
  const advisorClients = [
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
  const advisorCases = [
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
    if (!referralCode) {
      const generateReferralCode = () => {
        const firstName = username.toLowerCase() || ""
        const randomNum = Math.floor(Math.random() * 1000)
        return `${firstName}${randomNum}`
      }
      setReferralCode(generateReferralCode())
    }
  }, [referralCode, username])

  // Fetch referral stats for clients
  useEffect(() => {
    if (userRole === "client" && user.id) {
      fetchReferralStats()
    }
  }, [userRole, user])

  const fetchReferralStats = async () => {
    try {
      // Use the new SQL function to get referral stats
      const { data, error } = await supabase.rpc("get_referral_stats", {
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
    const referralLink = `https://foxlawyer.vercel.app/register?ref=${referralCode}`
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Error copying to clipboard:", err)
    }
  }

  const openChatForCase = (caseId) => {
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

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <UserInfoCard username={username} avatarUrl={avatarUrl} userRole={userRole} />
        <StatsGrid userRole={userRole} />
      </div>

      {userRole === "client" && (
        <>
          <ClientCasesSection />
          <MessagesSection />
          <QuotesSection />
          <SubscriptionsSection />
        </>
      )}

      {userRole === "advisor" && (
        <>
          <AdvisorCasesSection />
          <AdvisorClientsSection />
          <FinancialOverviewSection />
          <ReferralsSection />
          <MessagesSection />
          {/* Inquiries section is now a separate page */}
        </>
      )}

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2">
        <RecentActivityCard />
        <UpcomingAppointmentsCard />
      </div>

      <SettingsSection />
    </div>
  )
}
