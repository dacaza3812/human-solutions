"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ProtectedRoute } from "@/components/protected-route"
import { supabaseService } from "@/lib/supabase" // Import supabaseService

// Import dashboard sections
import { OverviewSection } from "@/components/dashboard/overview-section"
import { ClientsSection } from "@/components/dashboard/clients-section"
import { CasesSection } from "@/components/dashboard/cases-section"
import { AppointmentsSection } from "@/components/dashboard/appointments-section"
import { CalendarSection } from "@/components/dashboard/calendar-section"
import { MessagesSection } from "@/components/dashboard/messages-section"
import { FinancialSection } from "@/components/dashboard/financial-section"
import { AnalyticsSection } from "@/components/dashboard/analytics-section"
import { SubscriptionsSection } from "@/components/dashboard/subscriptions-section"
import { ReferralsSection } from "@/components/dashboard/referrals-section"
import { SettingsSection } from "@/components/dashboard/settings-section"

import {
  Home,
  Users,
  FileText,
  Settings,
  BarChart3,
  CalendarIcon,
  MessageCircle,
  Bell,
  LogOut,
  Menu,
  X,
  User,
  UserPlus,
  CalendarDays,
  PieChart,
  CreditCard,
} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

function DashboardContent() {
  const [activeView, setActiveView] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [referralStats, setReferralStats] = useState({
    total_referrals: 0,
    active_referrals: 0,
    total_earnings: 0,
    monthly_earnings: 0,
  })
  const [referralCode, setReferralCode] = useState("")
  const [copySuccess, setCopySuccess] = useState(false)
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [activeChat, setActiveChat] = useState<number | null>(null)
  const [clientFilter, setClientFilter] = useState("")
  \
  const [caseFilter, setCaseFilter("all\")\
  const { user, profile, signOut, updateUserProfile, changePassword, refreshProfile } = useAuth() // Add refreshProfile\
  const router = useRouter()\
  const searchParams = useSearchParams()
  \
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  \
  const [dateRange, setDateRange({\
    start: "2024-01-01",\
    end: "2024-12-31",\
}
)

// State for Settings section\
const [currentPassword, setCurrentPassword("\")\
  const [newPassword, setNewPassword(\"\")\
  const [confirmNewPassword, setConfirmNewPassword(\"\")\
  const [passwordChangeMessage, setPasswordChangeMessage(\"\")\
  const [passwordChangeError, setPasswordChangeError(\"\")
\
const [firstName, setFirstName(profile?.first_name || "\")\
  const [lastName, setLastName(profile?.last_name || \"\")\
  const [profileUpdateMessage, setProfileUpdateMessage("")
const [profileUpdateError, setProfileUpdateError(""
)

const [newReferralCode, setNewReferralCode(profile?.referral_code || ""
)
const [referralCodeUpdateMessage, setReferralCodeUpdateMessage(""
)
const [referralCodeUpdateError, setReferralCodeUpdateError(""
)
const [subscriptionInfo, setSubscriptionInfo<any>(null
)
const [loadingSubscription, setLoadingSubscription(false
)
const [paymentHistory, setPaymentHistory<any[]
>([])
const [loadingPayments, setLoadingPayments(false
)

  useEffect(() =>
{
  if (profile) {
    setFirstName(profile.first_name || "")
    setLastName(profile.last_name || "")
    setNewReferralCode(profile.referral_code || "")
  }
}
, [profile])

// Mock data for current user's cases (client view)
const userCases = [
  {
    id: 1,
    title: "Asesoría Financiera Personal",
    type: "Asesoría Financiera",
    status: "En Progreso",
    advisor: "Dr. María González",
    advisorAvatar: "/placeholder-user.jpg",
    description: "Planificación presupuestaria y estrategias de ahorro para mejorar la situación financiera familiar.",
    createdDate: "2024-01-15",
    nextAppointment: "2024-01-25 10:00 AM",
    progress: 65,
    priority: "Alta",
    documents: ["Presupuesto_Familiar.pdf", "Plan_Ahorro.pdf"],
    notes: "Cliente muy comprometido con el proceso. Necesita seguimiento semanal.",
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
    priority: "Media",
    documents: ["Acuerdo_Inicial.pdf"],
    notes: "Primera sesión programada. Ambas partes están dispuestas a colaborar.",
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
    priority: "Baja",
    documents: ["Dictamen_Legal.pdf", "Recomendaciones.pdf"],
    notes: "Caso resuelto satisfactoriamente. Cliente informado de sus derechos.",
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
    description: "Planificación presupuestaria y estrategias de ahorro para mejorar la situación financiera familiar.",
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

// Handle planId from URL after successful checkout
useEffect(() => {
  const planId = searchParams.get("planId")
  const success = searchParams.get("success")

  if (success === "true" && planId) {
    console.log(`Successful checkout for planId: ${planId}. Refreshing profile...`)
    refreshProfile() // Refresh profile to get updated subscription status
    setActiveView("subscriptions") // Navigate to subscriptions section
    router.replace("/dashboard") // Clean the URL
  }
}, [searchParams, refreshProfile, router])

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

// Fetch subscription info
const fetchSubscriptionInfo = async () => {
  if (!profile?.id) return

  setLoadingSubscription(true)
  try {
    const { data, error } = await supabaseService.getSubscriptionInfo(profile.id)

    if (error) {
      console.error("Error fetching subscription info:", error)
      // Don't return early, set subscriptionInfo to null so plans are shown
      setSubscriptionInfo(null)
      return
    }

    // If no subscription data, set to empty object to indicate no active subscription
    setSubscriptionInfo(data || {})
  } catch (error) {
    console.error("Error fetching subscription info:", error)
    setSubscriptionInfo(null)
  } finally {
    setLoadingSubscription(false)
  }
}

// Fetch payment history
const fetchPaymentHistory = async () => {
  if (!profile?.id) return

  setLoadingPayments(true)
  try {
    const { data, error } = await supabaseService.getPaymentsByUser(profile.id)

    if (error) {
      console.error("Error fetching payment history:", error)
      setPaymentHistory([])
      return
    }

    setPaymentHistory(data || [])
  } catch (error) {
    console.error("Error fetching payment history:", error)
    setPaymentHistory([])
  } finally {
    setLoadingPayments(false)
  }
}

useEffect(() => {
  if (profile?.id) {
    fetchSubscriptionInfo()
    fetchPaymentHistory()
  }
}, [profile])

// Fetch referral stats for clients
const fetchReferralStats = async () => {
  if (!referralCode) return

  try {
    const { data, error } = await supabaseService.getReferralStats(referralCode)

    if (error) {
      console.error("Error fetching referral stats:", error)
      return
    }

    if (data) {
      setReferralStats(data)
    }
  } catch (error) {
    console.error("Error fetching referral stats:", error)
  }
}

useEffect(() => {
  if (profile?.account_type === "client" && referralCode) {
    fetchReferralStats()
  }
}, [profile, referralCode])

// Menu items based on user role
const getMenuItems = () => {
  const baseItems = [
    { id: "overview", name: "Resumen", icon: Home },
    { id: "subscriptions", name: "Suscripciones", icon: CreditCard },
    { id: "settings", name: "Configuración", icon: Settings },
  ]

  if (profile?.account_type === "advisor") {
    return [
      ...baseItems.slice(0, 1), // Keep overview
      { id: "clients", name: "Clientes", icon: Users },
      { id: "cases", name: "Casos", icon: FileText },
      { id: "financial", name: "Vista Financiera", icon: PieChart },
      { id: "analytics", name: "Análisis", icon: BarChart3 },
      { id: "calendar", name: "Calendario", icon: CalendarIcon },
      { id: "messages", name: "Mensajes", icon: MessageCircle },
      ...baseItems.slice(1), // Keep subscriptions and settings
    ]
  } else {
    // Client menu
    return [
      ...baseItems.slice(0, 1), // Keep overview
      { id: "referrals", name: "Referidos", icon: UserPlus },
      { id: "cases", name: "Mis Casos", icon: FileText },
      { id: "quotes", name: "Citas", icon: CalendarDays },
      { id: "calendar", name: "Calendario", icon: CalendarIcon },
      { id: "messages", name: "Mensajes", icon: MessageCircle },
      ...baseItems.slice(1), // Keep subscriptions and settings
    ]
  }
}

const sidebarItems = getMenuItems()

// Datos de ejemplo para la búsqueda
const searchableData = [
  { type: "client", name: "María González", description: "Cliente - Asesoría financiera", id: "1" },
  { type: "client", name: "Carlos Rodríguez", description: "Cliente - Mediación familiar", id: "2" },
  { type: "client", name: "Ana Martínez", description: "Cliente - Planificación presupuestaria", id: "3" },
  { type: "case", name: "Caso #1234", description: "Mediación familiar - En progreso", id: "4" },
  { type: "case", name: "Caso #1235", description: "Asesoría financiera - Completado", id: "5" },
  { type: "appointment", name: "Consulta 10:00 AM", description: "Ana Martínez - Hoy", id: "6" },
  { type: "appointment", name: "Consulta 2:30 PM", description: "Familia Rodríguez - Hoy", id: "7" },
]

const handleSearch = (query: string) => {
  setSearchQuery(query)

  if (query.trim() === "") {
    setSearchResults([])
    setShowSearchResults(false)
    return
  }

  const results = searchableData.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()),
  )

  setSearchResults(results)
  setShowSearchResults(true)
}

const handleSearchResultClick = (result: any) => {
  setSearchQuery(result.name)
  setShowSearchResults(false)
  console.log("Resultado seleccionado:", result)
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

const stats = [
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
    title: "Ganancias por Referidos",
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
  // Add more robust password strength validation here if needed (e.g., regex for special chars, numbers)

  // Supabase's updateUser does not require current password for security,
  // but it's good practice to include it for user experience and to prevent accidental changes.
  // For simplicity, we're not validating currentPassword against Supabase here.
  // A more secure approach would involve re-authenticating the user or using a server-side function.

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
  // Basic validation: only alphanumeric characters
  if (!/^[a-zA-Z0-9]+$/.test(newReferralCode)) {
    setReferralCodeUpdateError("El código de referido solo puede contener letras y números.")
    return
  }

  // In a real scenario, you'd check for uniqueness on the server-side (e.g., via a Supabase function/trigger)
  // For this mock, we'll just assume it's unique.

  const { error } = await updateUserProfile({ referral_code: newReferralCode })

  if (error) {
    setReferralCodeUpdateError(`Error al actualizar código de referido: ${error.message}`)
  } else {
    setReferralCodeUpdateMessage("Código de referido actualizado exitosamente.")
    setReferralCode(newReferralCode) // Update the local state used for referral link
  }
}

// Render the appropriate section based on activeView
const renderActiveSection = () => {
  switch (activeView) {
    case "overview":
      return <OverviewSection referralStats={referralStats} userCases={userCases} />
    case "clients":
      return profile?.account_type === "advisor" ? <ClientsSection /> : null
    case "cases":
      return <CasesSection cases={userCases} />
    case "quotes":
      return <AppointmentsSection />
    case "calendar":
      return <CalendarSection />
    case "messages":
      return <MessagesSection />
    case "financial":
      return profile?.account_type === "advisor" ? <FinancialSection /> : null
    case "analytics":
      return profile?.account_type === "advisor" ? <AnalyticsSection /> : null
    case "subscriptions":
      return (
        <SubscriptionsSection
          subscriptionInfo={subscriptionInfo}
          loadingSubscription={loadingSubscription}
          paymentHistory={paymentHistory}
          loadingPayments={loadingPayments}
          onRefreshPayments={fetchPaymentHistory}
        />
      )
    case "referrals":
      return profile?.account_type === "client" ? (
        <ReferralsSection referralStats={referralStats} referralCode={referralCode} />
      ) : null
    case "settings":
      return <SettingsSection />
    default:
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Vista en Desarrollo</h3>
          <p className="text-muted-foreground">
            La sección "{sidebarItems.find((item) => item.id === activeView)?.name}" estará disponible próximamente.
          </p>
        </div>
      )
  }
}

return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
              <img src="/fox-lawyer-logo.png" alt="Fox Lawyer" className="w-8 h-8" />
              <h1 className="text-xl font-bold text-foreground">Fox Lawyer</h1>
            </Link>

            <div className="flex items-center space-x-4">
              {/* Search Bar with Results - Fixed Icon Position */}
              <div className="hidden md:flex items-center space-x-2 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <Input
                    placeholder="Buscar clientes, casos, citas..."
                    className="w-64 pl-10"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => searchQuery && setShowSearchResults(true)}
                    onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  />

                  {/* Search Results Dropdown */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border/40 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleSearchResultClick(result)}
                          className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors border-b border-border/20 last:border-b-0"
                        >
                          <div className="font-medium text-sm text-foreground">{result.name}</div>
                          <div className="text-xs text-muted-foreground">{result.description}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No Results Message */}
                  {showSearchResults && searchResults.length === 0 && searchQuery.trim() !== "" && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border/40 rounded-md shadow-lg z-50 p-3">
                      <div className="text-sm text-muted-foreground text-center">
                        No se encontraron resultados para "{searchQuery}"
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <ThemeToggle />

              {/* User Profile Dropdown */}
              <div className="flex items-center space-x-2">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-foreground">
                    {profile?.first_name} {profile?.last_name}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">{profile?.account_type}</span>
                </div>
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Mobile Menu Button */}
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-border/40 transition-transform duration-300 ease-in-out`}
        >
          <div className="flex flex-col h-full">
            <div className="p-6">
              <div className="flex items-center justify-between lg:hidden">
                <span className="text-lg font-semibold">Menú</span>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Mobile Search */}
              <div className="lg:hidden mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <Input
                    placeholder="Buscar..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />

                  {/* Mobile Search Results */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border/40 rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleSearchResultClick(result)}
                          className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors border-b border-border/20 last:border-b-0"
                        >
                          <div className="font-medium text-sm text-foreground">{result.name}</div>
                          <div className="text-xs text-muted-foreground">{result.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === item.id
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-border/40">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={signOut}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{renderActiveSection()}</main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
