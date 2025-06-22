"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { SubscriptionsSection } from "@/components/dashboard/subscriptions-section"
import {
  Home,
  Users,
  FileText,
  Settings,
  BarChart3,
  Calendar,
  MessageCircle,
  Bell,
  Search,
  Plus,
  TrendingUp,
  DollarSign,
  Target,
  Award,
  LogOut,
  Menu,
  X,
  User,
  Share2,
  Copy,
  CheckCircle,
  Gift,
  UserPlus,
  CalendarDays,
  PieChart,
  Eye,
  Send,
  Key,
  UserRound,
  LinkIcon,
  CreditCard,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Calendar as CalendarComponent } from "@/components/calendar-component"
import { FinancialCharts } from "@/components/financial-charts"
import { ChatInterface } from "@/components/chat-interface"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
  const [caseFilter, setCaseFilter] = useState("all")
  const { user, profile, signOut, updateUserProfile, changePassword } = useAuth()

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
  }, [profile])

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
    if (profile?.account_type === "client" && profile.id) {
      fetchReferralStats()
    }
  }, [profile])

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

  // Menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      { id: "overview", name: "Resumen", icon: Home },
      { id: "settings", name: "Configuración", icon: Settings },
    ]

    if (profile?.account_type === "advisor") {
      return [
        ...baseItems.slice(0, 1), // Keep overview
        { id: "clients", name: "Clientes", icon: Users },
        { id: "cases", name: "Casos", icon: FileText },
        { id: "financial", name: "Vista Financiera", icon: PieChart },
        { id: "analytics", name: "Análisis", icon: BarChart3 },
        { id: "calendar", name: "Calendario", icon: Calendar },
        { id: "messages", name: "Mensajes", icon: MessageCircle },
        ...baseItems.slice(1), // Keep settings
      ]
    } else {
      // Client menu
      return [
        ...baseItems.slice(0, 1), // Keep overview
        { id: "subscriptions", name: "Suscripciones", icon: CreditCard },
        { id: "referrals", name: "Referidos", icon: UserPlus },
        { id: "cases", name: "Mis Casos", icon: FileText },
        { id: "quotes", name: "Citas", icon: CalendarDays },
        { id: "calendar", name: "Calendario", icon: Calendar },
        { id: "messages", name: "Mensajes", icon: MessageCircle },
        ...baseItems.slice(1), // Keep settings
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
        <main className="flex-1 p-6">
          {activeView === "overview" && (
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
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="text-foreground">Información de la Cuenta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Correo Electrónico</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo de Cuenta</p>
                      <p className="font-medium capitalize">{profile?.account_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                      <p className="font-medium">{profile?.phone || "No especificado"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                      <p className="font-medium">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(profile?.account_type === "advisor" ? stats : clientStats).map((stat, index) => (
                  <Card key={index} className="border-border/40">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.title}</p>
                          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                          <p className={`text-sm ${stat.color}`}>{stat.change}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center`}>
                          <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="flex items-center text-foreground">
                      <TrendingUp className="w-5 h-5 mr-2 text-emerald-400" />
                      Actividad Reciente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3 p-3 rounded-lg border border-border/40"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            activity.status === "success"
                              ? "bg-emerald-400"
                              : activity.status === "completed"
                                ? "bg-blue-400"
                                : activity.status === "payment"
                                  ? "bg-purple-400"
                                  : "bg-orange-400"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{activity.type}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="text-foreground">Próximas Citas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground">Consulta Financiera</p>
                        <span className="text-xs text-emerald-400">10:00 AM</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Ana Martínez - Planificación presupuestaria</p>
                    </div>
                    <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground">Mediación Familiar</p>
                        <span className="text-xs text-blue-400">2:30 PM</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Familia Rodríguez - Resolución de conflictos</p>
                    </div>
                    <div className="p-4 rounded-lg border border-purple-500/20 bg-purple-500/5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground">Consulta Profesional</p>
                        <span className="text-xs text-purple-400">4:00 PM</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Luis Fernández - Asesoría empresarial</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Subscriptions Section - Only for Clients */}
          {activeView === "subscriptions" && profile?.account_type === "client" && <SubscriptionsSection />}

          {/* Client Cases Section */}
          {activeView === "cases" && profile?.account_type === "client" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Mis Casos</h2>
                  <p className="text-muted-foreground">Gestiona y revisa el progreso de tus casos</p>
                </div>
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Solicitar Nuevo Caso
                </Button>
              </div>

              <div className="grid gap-6">
                {userCases.map((case_item) => (
                  <Card key={case_item.id} className="border-border/40">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-foreground">{case_item.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{case_item.type}</p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            case_item.status === "Completada"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
                              : case_item.status === "En Progreso"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          }`}
                        >
                          {case_item.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{case_item.description}</p>

                      {/* Advisor Info */}
                      <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={case_item.advisorAvatar || "/placeholder.svg"} />
                          <AvatarFallback>{case_item.advisor.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Asesor Asignado</p>
                          <p className="text-sm text-muted-foreground">{case_item.advisor}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openChatForCase(case_item.id)}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Mensaje
                        </Button>
                      </div>

                      {/* Progress Bar */}
                      {case_item.status !== "Completada" && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progreso</span>
                            <span className="text-foreground">{case_item.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full transition-all"
                              style={{ width: `${case_item.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Case Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Fecha de Creación</p>
                          <p className="font-medium">{new Date(case_item.createdDate).toLocaleDateString()}</p>
                        </div>
                        {case_item.nextAppointment && (
                          <div>
                            <p className="text-muted-foreground">Próxima Cita</p>
                            <p className="font-medium">{case_item.nextAppointment}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Advisor Cases Section */}
          {activeView === "cases" && profile?.account_type === "advisor" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Mis Casos Asignados</h2>
                  <p className="text-muted-foreground">Gestiona los casos de tus clientes</p>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={caseFilter}
                    onChange={(e) => setCaseFilter(e.target.value)}
                    className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="all">Todos los casos</option>
                    <option value="en progreso">En Progreso</option>
                    <option value="programada">Programados</option>
                    <option value="en revisión">En Revisión</option>
                  </select>
                  <Button className="bg-emerald-500 hover:bg-emerald-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Caso
                  </Button>
                </div>
              </div>

              <Card className="border-border/40">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/40">
                          <th className="text-left py-4 px-6 font-medium text-muted-foreground">Cliente</th>
                          <th className="text-left py-4 px-6 font-medium text-muted-foreground">Caso</th>
                          <th className="text-left py-4 px-6 font-medium text-muted-foreground">Tipo</th>
                          <th className="text-left py-4 px-6 font-medium text-muted-foreground">Estado</th>
                          <th className="text-left py-4 px-6 font-medium text-muted-foreground">Prioridad</th>
                          <th className="text-left py-4 px-6 font-medium text-muted-foreground">Fecha Límite</th>
                          <th className="text-center py-4 px-6 font-medium text-muted-foreground">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCases.map((case_item) => (
                          <tr
                            key={case_item.id}
                            className="border-b border-border/20 hover:bg-muted/50 cursor-pointer"
                            onClick={() => setSelectedCase(case_item)}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback>{case_item.clientName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{case_item.clientName}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <p className="font-medium text-sm">{case_item.title}</p>
                                <p className="text-xs text-muted-foreground">#{case_item.id}</p>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-muted-foreground">{case_item.type}</td>
                            <td className="py-4 px-6">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  case_item.status === "En Progreso"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                    : case_item.status === "Programada"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                      : "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                                }`}
                              >
                                {case_item.status}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  case_item.priority === "Alta"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                    : case_item.priority === "Media"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                      : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                }`}
                              >
                                {case_item.priority}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-sm">{new Date(case_item.dueDate).toLocaleDateString()}</td>
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openChatForCase(case_item.id)
                                  }}
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedCase(case_item)
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Case Detail Modal */}
              {selectedCase && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{selectedCase.title}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedCase(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Cliente</p>
                          <p className="font-medium">{selectedCase.clientName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Tipo de Caso</p>
                          <p className="font-medium">{selectedCase.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Estado</p>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              selectedCase.status === "En Progreso"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                : selectedCase.status === "Programada"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                  : "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                            }`}
                          >
                            {selectedCase.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Prioridad</p>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              selectedCase.priority === "Alta"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                : selectedCase.priority === "Media"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            }`}
                          >
                            {selectedCase.priority}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                          <p className="font-medium">{new Date(selectedCase.createdDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Fecha Límite</p>
                          <p className="font-medium">{new Date(selectedCase.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Descripción</p>
                        <p className="text-sm">{selectedCase.description}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progreso del Caso</span>
                          <span className="text-foreground">{selectedCase.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all"
                            style={{ width: `${selectedCase.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                          onClick={() => {
                            openChatForCase(selectedCase.id)
                            setSelectedCase(null)
                          }}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Mensaje
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <FileText className="w-4 h-4 mr-2" />
                          Ver Documentos
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Advisor Clients Section */}
          {activeView === "clients" && profile?.account_type === "advisor" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Mis Clientes</h2>
                  <p className="text-muted-foreground">Gestiona la información de tus clientes</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar clientes..."
                      className="pl-10 w-64"
                      value={clientFilter}
                      onChange={(e) => setClientFilter(e.target.value)}
                    />
                  </div>
                  <Button className="bg-emerald-500 hover:bg-emerald-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Cliente
                  </Button>
                </div>
              </div>

              {/* Client Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-border/40">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Clientes</p>
                        <p className="text-2xl font-bold text-foreground">{advisorClients.length}</p>
                        <p className="text-sm text-emerald-400">+2 este mes</p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-emerald-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/40">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Casos Activos</p>
                        <p className="text-2xl font-bold text-foreground">
                          {advisorClients.reduce((sum, client) => sum + client.activeCases, 0)}
                        </p>
                        <p className="text-sm text-blue-400">En progreso</p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/40">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Casos Completados</p>
                        <p className="text-2xl font-bold text-foreground">
                          {advisorClients.reduce((sum, client) => sum + client.completedCases, 0)}
                        </p>
                        <p className="text-sm text-purple-400">Este mes</p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/40">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Satisfacción</p>
                        <p className="text-2xl font-bold text-foreground">98%</p>
                        <p className="text-sm text-orange-400">Promedio</p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <Award className="w-6 h-6 text-orange-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Clients Grid */}
              <div className="grid gap-6">
                {filteredClients.map((client) => (
                  <Card
                    key={client.id}
                    className="border-border/40 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedClient(client)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={client.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">{client.name}</h3>
                            <p className="text-sm text-muted-foreground">{client.email}</p>
                            <p className="text-sm text-muted-foreground">{client.phone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Última actividad</p>
                          <p className="text-sm font-medium">{new Date(client.lastActivity).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/40">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-emerald-400">{client.totalCases}</p>
                          <p className="text-xs text-muted-foreground">Total Casos</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-400">{client.activeCases}</p>
                          <p className="text-xs text-muted-foreground">Activos</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-400">{client.completedCases}</p>
                          <p className="text-xs text-muted-foreground">Completados</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Client Detail Modal */}
              {selectedClient && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={selectedClient.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{selectedClient.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-xl">{selectedClient.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedClient(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Teléfono</p>
                          <p className="font-medium">{selectedClient.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                          <p className="font-medium">{new Date(selectedClient.joinDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Última Actividad</p>
                          <p className="font-medium">{new Date(selectedClient.lastActivity).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Estado</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                            Activo
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <Card className="border-border/40">
                          <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-emerald-400">{selectedClient.totalCases}</p>
                            <p className="text-sm text-muted-foreground">Total Casos</p>
                          </CardContent>
                        </Card>
                        <Card className="border-border/40">
                          <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-blue-400">{selectedClient.activeCases}</p>
                            <p className="text-sm text-muted-foreground">Casos Activos</p>
                          </CardContent>
                        </Card>
                        <Card className="border-border/40">
                          <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-purple-400">{selectedClient.completedCases}</p>
                            <p className="text-sm text-muted-foreground">Completados</p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                          onClick={() => {
                            // Find a case for this client to open chat
                            const clientCase = advisorCases.find((c) => c.clientId === selectedClient.id)
                            if (clientCase) {
                              openChatForCase(clientCase.id)
                              setSelectedClient(null)
                            }
                          }}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Enviar Mensaje
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <FileText className="w-4 h-4 mr-2" />
                          Ver Casos
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Messages Section */}
          {activeView === "messages" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Mensajes</h2>
                  <p className="text-muted-foreground">
                    {profile?.account_type === "client"
                      ? "Comunícate con tus asesores asignados"
                      : "Comunícate con tus clientes"}
                  </p>
                </div>
              </div>

              {activeChat ? (
                <div className="space-y-4">
                  <Button variant="outline" onClick={() => setActiveChat(null)} className="mb-4">
                    ← Volver a conversaciones
                  </Button>

                  {profile?.account_type === "client"
                    ? (() => {
                        const case_item = userCases.find((c) => c.id === activeChat)
                        return case_item ? (
                          <ChatInterface
                            caseId={activeChat}
                            advisorName={case_item.advisor}
                            advisorAvatar={case_item.advisorAvatar}
                            currentUser="client"
                          />
                        ) : null
                      })()
                    : (() => {
                        const case_item = advisorCases.find((c) => c.id === activeChat)
                        return case_item ? (
                          <ChatInterface
                            caseId={activeChat}
                            advisorName={`${profile?.first_name} ${profile?.last_name}`}
                            advisorAvatar="/placeholder-user.jpg"
                            currentUser="advisor"
                          />
                        ) : null
                      })()}
                </div>
              ) : (
                <div className="grid gap-4">
                  <h3 className="text-lg font-semibold text-foreground">Conversaciones Activas</h3>

                  {profile?.account_type === "client"
                    ? userCases
                        .filter((c) => c.status !== "Completada")
                        .map((case_item) => (
                          <Card
                            key={case_item.id}
                            className="border-border/40 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setActiveChat(case_item.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-4">
                                <Avatar className="w-12 h-12">
                                  <AvatarImage src={case_item.advisorAvatar || "/placeholder.svg"} />
                                  <AvatarFallback>{case_item.advisor.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-foreground">{case_item.advisor}</h4>
                                  <p className="text-sm text-muted-foreground">{case_item.title}</p>
                                  <p className="text-xs text-muted-foreground">Último mensaje: Hace 2 horas</p>
                                </div>
                                <div className="text-right">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                                    {case_item.status}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                    : advisorCases
                        .filter((c) => c.status !== "Completada")
                        .map((case_item) => (
                          <Card
                            key={case_item.id}
                            className="border-border/40 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setActiveChat(case_item.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-4">
                                <Avatar className="w-12 h-12">
                                  <AvatarFallback>{case_item.clientName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-foreground">{case_item.clientName}</h4>
                                  <p className="text-sm text-muted-foreground">{case_item.title}</p>
                                  <p className="text-xs text-muted-foreground">Último mensaje: Hace 1 hora</p>
                                </div>
                                <div className="text-right">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                    {case_item.status}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                </div>
              )}
            </div>
          )}

          {/* Quotes Section - Only for Clients */}
          {activeView === "quotes" && profile?.account_type === "client" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Mis Citas</h2>
                  <p className="text-muted-foreground">Gestiona tus citas y consultas programadas</p>
                </div>
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Cita
                </Button>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-1">
                  <CalendarComponent selectedDate={selectedDate} onDateSelect={setSelectedDate} />
                </div>

                {/* Cases Table - Only scheduled cases for current user */}
                <div className="lg:col-span-2">
                  <Card className="border-border/40">
                    <CardHeader>
                      <CardTitle className="text-foreground">Mis Citas Programadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border/40">
                              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Asesor</th>
                              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tipo</th>
                              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fecha</th>
                              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Hora</th>
                              <th className="text-center py-3 px-4 font-medium text-muted-foreground">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userScheduledCases.map((case_item) => (
                              <tr key={case_item.id} className="border-b border-border/20 hover:bg-muted/50">
                                <td className="py-3 px-4 text-sm font-medium">{case_item.advisor}</td>
                                <td className="py-3 px-4 text-sm text-muted-foreground">{case_item.type}</td>
                                <td className="py-3 px-4 text-sm">
                                  {new Date(case_item.createdDate).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 text-sm">
                                  {case_item.nextAppointment?.split(" ")[1] || "Por definir"}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      case_item.status === "En Progreso"
                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                    }`}
                                  >
                                    {case_item.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Financial Overview Section - Only for Advisors */}
          {activeView === "financial" && profile?.account_type === "advisor" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Vista Financiera</h2>
                  <p className="text-muted-foreground">Análisis detallado de ingresos, gastos y métricas financieras</p>
                </div>
                <div className="flex space-x-2">
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-40"
                  />
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-40"
                  />
                </div>
              </div>

              <FinancialCharts dateRange={dateRange} />
            </div>
          )}

          {/* Referrals Section - Only for Clients */}
          {activeView === "referrals" && profile?.account_type === "client" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Programa de Referidos</h2>
                  <p className="text-muted-foreground">Gana dinero compartiendo Fox Lawyer con tus amigos</p>
                </div>
              </div>

              {/* Referral Link Card */}
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground">
                    <Share2 className="w-5 h-5 mr-2 text-emerald-400" />
                    Tu Enlace de Referido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="referralLink" className="text-sm font-medium">
                      Enlace de Referido
                    </Label>
                    <div className="flex mt-2">
                      <Input
                        id="referralLink"
                        value={`https://foxlawyer.vercel.app/register?ref=${referralCode}`}
                        readOnly
                        className="flex-1"
                      />
                      <Button onClick={copyReferralLink} variant="outline" className="ml-2" disabled={copySuccess}>
                        {copySuccess ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Gift className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-semibold text-emerald-400">¿Cómo funciona?</h4>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Comparte tu enlace único con amigos y familiares</li>
                      <li>• Gana $25 USD por cada persona que se registre usando tu enlace</li>
                      <li>• Los pagos se procesan automáticamente cada mes</li>
                      <li>• No hay límite en la cantidad de referidos</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Referral Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-border/40">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Referidos</p>
                        <p className="text-2xl font-bold text-foreground">{referralStats.total_referrals}</p>
                        <p className="text-sm text-emerald-400">Todos los tiempos</p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <UserPlus className="w-6 h-6 text-emerald-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/40">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Referidos Activos</p>
                        <p className="text-2xl font-bold text-foreground">{referralStats.active_referrals}</p>
                        <p className="text-sm text-blue-400">Usuarios activos</p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/40">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Ganancias Totales</p>
                        <p className="text-2xl font-bold text-foreground">${referralStats.total_earnings}</p>
                        <p className="text-sm text-purple-400">USD ganados</p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/40">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Este Mes</p>
                        <p className="text-2xl font-bold text-foreground">${referralStats.monthly_earnings}</p>
                        <p className="text-sm text-orange-400">Ganancias mensuales</p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-orange-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Share Options */}
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="text-foreground">Compartir en Redes Sociales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button
                      variant="outline"
                      className="h-12"
                      onClick={() => {
                        const text = `¡Únete a Fox Lawyer y transforma tus problemas en oportunidades! Usa mi enlace de referido: https://foxlawyer.vercel.app/register?ref=${referralCode}`
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
                      }}
                    >
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12"
                      onClick={() => {
                        const text = `¡Únete a Fox Lawyer! https://foxlawyer.vercel.app/register?ref=${referralCode}`
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank")
                      }}
                    >
                      Twitter
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12"
                      onClick={() => {
                        const text = `¡Únete a Fox Lawyer! https://foxlawyer.vercel.app/register?ref=${referralCode}`
                        window.open(
                          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(text)}`,
                          "_blank",
                        )
                      }}
                    >
                      Facebook
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12"
                      onClick={() => {
                        const subject = "Únete a Fox Lawyer"
                        const body = `¡Hola! Te invito a unirte a Fox Lawyer, una plataforma increíble de asesoría personalizada. Usa mi enlace de referido: https://foxlawyer.vercel.app/register?ref=${referralCode}`
                        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
                      }}
                    >
                      Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Section */}
          {activeView === "settings" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Configuración de la Cuenta</h2>
                  <p className="text-muted-foreground">Gestiona tu información personal y de seguridad</p>
                </div>
              </div>

              {/* Change Password Card */}
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground">
                    <Key className="w-5 h-5 mr-2 text-purple-400" />
                    Cambiar Contraseña
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Contraseña Actual</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">Nueva Contraseña</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmNewPassword">Confirmar Nueva Contraseña</Label>
                      <Input
                        id="confirmNewPassword"
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    {passwordChangeError && <p className="text-red-500 text-sm">{passwordChangeError}</p>}
                    {passwordChangeMessage && <p className="text-emerald-500 text-sm">{passwordChangeMessage}</p>}
                    <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
                      Actualizar Contraseña
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Update Profile Information Card */}
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground">
                    <UserRound className="w-5 h-5 mr-2 text-blue-400" />
                    Actualizar Información de Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                    {profileUpdateError && <p className="text-red-500 text-sm">{profileUpdateError}</p>}
                    {profileUpdateMessage && <p className="text-emerald-500 text-sm">{profileUpdateMessage}</p>}
                    <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
                      Guardar Cambios
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Update Referral Code Card */}
              {profile?.account_type === "client" && ( // Only show for clients
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="flex items-center text-foreground">
                      <LinkIcon className="w-5 h-5 mr-2 text-orange-400" />
                      Modificar Código de Referido
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleReferralCodeUpdate} className="space-y-4">
                      <div>
                        <Label htmlFor="newReferralCode">Nuevo Código de Referido</Label>
                        <Input
                          id="newReferralCode"
                          type="text"
                          value={newReferralCode}
                          onChange={(e) => setNewReferralCode(e.target.value)}
                          placeholder="Ej: TUCODIGOUNICO"
                          required
                        />
                      </div>
                      {referralCodeUpdateError && <p className="text-red-500 text-sm">{referralCodeUpdateError}</p>}
                      {referralCodeUpdateMessage && (
                        <p className="text-emerald-500 text-sm">{referralCodeUpdateMessage}</p>
                      )}
                      <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
                        Actualizar Código
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeView !== "overview" &&
            activeView !== "subscriptions" &&
            activeView !== "referrals" &&
            activeView !== "quotes" &&
            activeView !== "financial" &&
            activeView !== "cases" &&
            activeView !== "clients" &&
            activeView !== "messages" &&
            activeView !== "settings" && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Vista en Desarrollo</h3>
                <p className="text-muted-foreground">
                  La sección "{sidebarItems.find((item) => item.id === activeView)?.name}" estará disponible
                  próximamente.
                </p>
              </div>
            )}
        </main>
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
