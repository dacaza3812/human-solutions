"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context-complete"
import { supabase } from "@/lib/supabase"
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
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface ReferralStats {
  total_referrals: number
  active_referrals: number
  total_earnings: number
  monthly_earnings: number
}

function DashboardContent() {
  const [activeView, setActiveView] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    total_referrals: 0,
    active_referrals: 0,
    total_earnings: 0,
    monthly_earnings: 0,
  })
  const [copySuccess, setCopySuccess] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [referralList, setReferralList] = useState<any[]>([])

  const { user, profile, signOut, refreshProfile } = useAuth()

  // Fetch referral stats for clients
  useEffect(() => {
    if (profile?.account_type === "client" && profile.id) {
      fetchReferralStats()
      fetchReferralList()
    }
  }, [profile])

  const fetchReferralStats = async () => {
    if (!profile?.id) return

    setLoadingStats(true)
    try {
      console.log("[DASHBOARD] Fetching referral stats for user:", profile.id)

      // Usar la función SQL optimizada
      const { data: functionData, error: functionError } = await supabase.rpc("get_referral_stats_by_id", {
        user_profile_id: profile.id,
      })

      if (functionError) {
        console.error("[DASHBOARD] Error calling get_referral_stats_by_id:", functionError)

        // Fallback: consulta directa
        const { data: referralsData, error: referralsError } = await supabase
          .from("referrals")
          .select("*")
          .eq("referrer_id", profile.id)

        if (referralsError) {
          console.error("[DASHBOARD] Error fetching referrals directly:", referralsError)
          return
        }

        console.log("[DASHBOARD] Fallback referrals data:", referralsData)
        calculateStatsManually(referralsData || [])
      } else {
        console.log("[DASHBOARD] Function data received:", functionData)
        if (functionData && functionData.length > 0) {
          const stats = functionData[0]
          setReferralStats({
            total_referrals: Number(stats.total_referrals) || 0,
            active_referrals: Number(stats.active_referrals) || 0,
            total_earnings: Number(stats.total_earnings) || 0,
            monthly_earnings: Number(stats.monthly_earnings) || 0,
          })
        }
      }
    } catch (error) {
      console.error("[DASHBOARD] Error fetching referral stats:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  const calculateStatsManually = (referralsData: any[]) => {
    const totalReferrals = referralsData.length
    const activeReferrals = referralsData.filter((r) => r.status === "active").length
    const totalEarnings = referralsData.reduce((sum, r) => sum + (Number(r.commission_earned) || 0), 0)

    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const monthlyEarnings = referralsData
      .filter((r) => new Date(r.created_at) >= currentMonth)
      .reduce((sum, r) => sum + (Number(r.commission_earned) || 0), 0)

    setReferralStats({
      total_referrals: totalReferrals,
      active_referrals: activeReferrals,
      total_earnings: totalEarnings,
      monthly_earnings: monthlyEarnings,
    })
  }

  const fetchReferralList = async () => {
    if (!profile?.id) return

    try {
      console.log("[DASHBOARD] Fetching referral list for user:", profile.id)

      const { data, error } = await supabase
        .from("referrals")
        .select(`
          *,
          referred_profile:referred_id (
            id,
            first_name,
            last_name,
            email,
            created_at
          )
        `)
        .eq("referrer_id", profile.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[DASHBOARD] Error fetching referral list:", error)
        return
      }

      console.log("[DASHBOARD] Referral list data:", data)
      setReferralList(data || [])
    } catch (error) {
      console.error("[DASHBOARD] Error fetching referral list:", error)
    }
  }

  const handleRefreshProfile = async () => {
    setProfileLoading(true)
    try {
      await refreshProfile()
      if (profile?.account_type === "client") {
        await fetchReferralStats()
        await fetchReferralList()
      }
    } catch (error) {
      console.error("[DASHBOARD] Error refreshing profile:", error)
    } finally {
      setProfileLoading(false)
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
        ...baseItems.slice(0, 1),
        { id: "clients", name: "Clientes", icon: Users },
        { id: "cases", name: "Casos", icon: FileText },
        { id: "analytics", name: "Análisis", icon: BarChart3 },
        { id: "calendar", name: "Calendario", icon: Calendar },
        { id: "messages", name: "Mensajes", icon: MessageCircle },
        ...baseItems.slice(1),
      ]
    } else {
      return [
        ...baseItems.slice(0, 1),
        { id: "referrals", name: "Referidos", icon: UserPlus },
        { id: "cases", name: "Mis Casos", icon: FileText },
        { id: "calendar", name: "Citas", icon: Calendar },
        { id: "messages", name: "Mensajes", icon: MessageCircle },
        ...baseItems.slice(1),
      ]
    }
  }

  const sidebarItems = getMenuItems()

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
    if (!profile?.referral_code) {
      console.error("[DASHBOARD] Referral code not available")
      alert("Tu código de referido aún no está disponible. Por favor, actualiza tu perfil.")
      return
    }

    const referralLink = `${window.location.origin}/register?ref=${profile.referral_code}`

    try {
      await navigator.clipboard.writeText(referralLink)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
      console.log("[DASHBOARD] Referral link copied:", referralLink)
    } catch (err) {
      console.error("[DASHBOARD] Error copying to clipboard:", err)
      alert("Error al copiar el enlace. Por favor, cópialo manualmente.")
    }
  }

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
      value: "3",
      change: "+1",
      icon: FileText,
      color: "text-emerald-400",
    },
    {
      title: "Referidos Totales",
      value: loadingStats ? "..." : referralStats.total_referrals.toString(),
      change: `+${Math.floor(referralStats.monthly_earnings / 25)}`,
      icon: UserPlus,
      color: "text-blue-400",
    },
    {
      title: "Ganancias por Referidos",
      value: loadingStats ? "..." : `$${referralStats.total_earnings.toFixed(2)}`,
      change: `+$${referralStats.monthly_earnings.toFixed(2)}`,
      icon: DollarSign,
      color: "text-purple-400",
    },
    {
      title: "Próximas Citas",
      value: "2",
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
              {/* Search Bar */}
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

                  {/* Search Results */}
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
                </div>
              </div>

              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <ThemeToggle />

              {/* User Profile */}
              <div className="flex items-center space-x-2">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-foreground">
                    {profile?.first_name || "Usuario"} {profile?.last_name || ""}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">{profile?.account_type || "cliente"}</span>
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
                  <h2 className="text-3xl font-bold text-foreground">Bienvenido, {profile?.first_name || "Usuario"}</h2>
                  <p className="text-muted-foreground">Aquí tienes un resumen de tu actividad</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleRefreshProfile} disabled={profileLoading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${profileLoading ? "animate-spin" : ""}`} />
                    Actualizar
                  </Button>
                  {profile?.account_type === "advisor" && (
                    <Button className="bg-emerald-500 hover:bg-emerald-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Caso
                    </Button>
                  )}
                </div>
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
                      <p className="font-medium">{user?.email || "No disponible"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo de Cuenta</p>
                      <p className="font-medium capitalize">{profile?.account_type || "cliente"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                      <p className="font-medium">{profile?.phone || "No especificado"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                      <p className="font-medium">
                        {profile?.created_at
                          ? new Date(profile.created_at).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "No disponible"}
                      </p>
                    </div>
                    {profile?.referral_code && (
                      <div>
                        <p className="text-sm text-muted-foreground">Tu Código de Referido</p>
                        <p className="font-medium font-mono text-emerald-400">{profile.referral_code}</p>
                      </div>
                    )}
                    {profile?.referred_by && (
                      <div>
                        <p className="text-sm text-muted-foreground">Referido por</p>
                        <p className="font-medium font-mono text-blue-400">{profile.referred_by}</p>
                      </div>
                    )}
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

          {/* Referrals Section */}
          {activeView === "referrals" && profile?.account_type === "client" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Programa de Referidos</h2>
                  <p className="text-muted-foreground">Gana dinero compartiendo Fox Lawyer con tus amigos</p>
                </div>
                <Button variant="outline" onClick={fetchReferralStats} disabled={loadingStats}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingStats ? "animate-spin" : ""}`} />
                  Actualizar
                </Button>
              </div>

              {/* Debug Info - Solo en desarrollo */}
              {process.env.NODE_ENV === "development" && (
                <Card className="border-yellow-500/20 bg-yellow-500/5">
                  <CardHeader>
                    <CardTitle className="text-yellow-400 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Debug Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <p>
                        <strong>User ID:</strong> {profile?.id}
                      </p>
                      <p>
                        <strong>Referral Code:</strong> {profile?.referral_code || "No generado"}
                      </p>
                      <p>
                        <strong>Referred By:</strong> {profile?.referred_by || "Ninguno"}
                      </p>
                      <p>
                        <strong>Account Type:</strong> {profile?.account_type}
                      </p>
                      <p>
                        <strong>Loading Stats:</strong> {loadingStats ? "Sí" : "No"}
                      </p>
                      <p>
                        <strong>Stats:</strong> {JSON.stringify(referralStats)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Referral Link Card */}
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground">
                    <Share2 className="w-5 h-5 mr-2 text-emerald-400" />
                    Tu Enlace de Referido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile?.referral_code ? (
                    <>
                      <div>
                        <Label htmlFor="referralLink" className="text-sm font-medium">
                          Enlace de Referido
                        </Label>
                        <div className="flex mt-2">
                          <Input
                            id="referralLink"
                            value={`${window.location.origin}/register?ref=${profile.referral_code}`}
                            readOnly
                            className="flex-1 font-mono text-sm"
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
                    </>
                  ) : (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                          Tu código de referido se está generando. Por favor, actualiza la página en unos momentos.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Referral Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-border/40">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Referidos</p>
                        <p className="text-2xl font-bold text-foreground">
                          {loadingStats ? "..." : referralStats.total_referrals}
                        </p>
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
                        <p className="text-2xl font-bold text-foreground">
                          {loadingStats ? "..." : referralStats.active_referrals}
                        </p>
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
                        <p className="text-2xl font-bold text-foreground">
                          {loadingStats ? "..." : `$${referralStats.total_earnings.toFixed(2)}`}
                        </p>
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
                        <p className="text-2xl font-bold text-foreground">
                          {loadingStats ? "..." : `$${referralStats.monthly_earnings.toFixed(2)}`}
                        </p>
                        <p className="text-sm text-orange-400">Ganancias mensuales</p>
                      </div>
                      <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-orange-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de Referidos */}
              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="text-foreground">Tus Referidos</CardTitle>
                </CardHeader>
                <CardContent>
                  {referralList.length > 0 ? (
                    <div className="space-y-4">
                      {referralList.map((referral) => (
                        <div
                          key={referral.id}
                          className="flex items-center justify-between p-4 border border-border/40 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {referral.referred_profile?.first_name} {referral.referred_profile?.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">{referral.referred_profile?.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-emerald-400">
                              ${Number(referral.commission_earned).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(referral.created_at).toLocaleDateString("es-ES")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Aún no tienes referidos</p>
                      <p className="text-sm text-muted-foreground">Comparte tu enlace para empezar a ganar</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Share Options */}
              {profile?.referral_code && (
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
                          const text = `¡Únete a Fox Lawyer y transforma tus problemas en oportunidades! Usa mi enlace de referido: ${window.location.origin}/register?ref=${profile.referral_code}`
                          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
                        }}
                      >
                        WhatsApp
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12"
                        onClick={() => {
                          const text = `¡Únete a Fox Lawyer! ${window.location.origin}/register?ref=${profile.referral_code}`
                          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank")
                        }}
                      >
                        Twitter
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12"
                        onClick={() => {
                          const text = `${window.location.origin}/register?ref=${profile.referral_code}`
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
                          const body = `¡Hola! Te invito a unirte a Fox Lawyer, una plataforma increíble de asesoría personalizada. Usa mi enlace de referido: ${window.location.origin}/register?ref=${profile.referral_code}`
                          window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
                        }}
                      >
                        Email
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeView !== "overview" && activeView !== "referrals" && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Vista en Desarrollo</h3>
              <p className="text-muted-foreground">
                La sección "{sidebarItems.find((item) => item.id === activeView)?.name}" estará disponible próximamente.
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
