"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
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
  LogOut,
  Menu,
  X,
  User,
  UserPlus,
  CalendarDays,
  PieChart,
  CreditCard,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Suspense } from "react"

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

interface ReferralStats {
  total_referrals: number
  active_referrals: number
  total_earnings: number
  monthly_earnings: number
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
  const [referralCode, setReferralCode] = useState("")
  const [copySuccess, setCopySuccess] = useState(false)

  const { user, profile, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Generate referral code on component mount or profile change
  useEffect(() => {
    if (profile && !referralCode) {
      const generateReferralCode = () => {
        const firstName = profile.first_name?.toLowerCase() || ""
        const lastName = profile.last_name?.toLowerCase() || ""
        const randomNum = Math.floor(Math.random() * 1000)
        return `${firstName}${lastName}${randomNum}`
      }
      setReferralCode(profile.referral_code || generateReferralCode())
    }
  }, [profile, referralCode])

  // Fetch referral stats for clients
  useEffect(() => {
    if (profile?.account_type === "client" && profile.id && referralCode) {
      fetchReferralStats()
    }
  }, [profile, referralCode]) // Depend on referralCode to refetch if it changes

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
      { id: "summary", name: "Resumen", icon: Home, href: "/dashboard/summary" },
      { id: "settings", name: "Configuración", icon: Settings, href: "/dashboard/settings" },
    ]

    if (profile?.account_type === "advisor") {
      return [
        ...baseItems.slice(0, 1), // Keep summary
        { id: "clients", name: "Clientes", icon: Users, href: "/dashboard/clients" },
        { id: "cases", name: "Casos", icon: FileText, href: "/dashboard/cases" },
        { id: "financial", name: "Vista Financiera", icon: PieChart, href: "/dashboard/financial" },
        { id: "analytics", name: "Análisis", icon: BarChart3, href: "/dashboard/analytics" },
        { id: "calendar", name: "Calendario", icon: Calendar, href: "/dashboard/calendar" },
        { id: "messages", name: "Mensajes", icon: MessageCircle, href: "/dashboard/messages" },
        ...baseItems.slice(1), // Keep settings
      ]
    } else {
      // Client menu
      return [
        ...baseItems.slice(0, 1), // Keep summary
        { id: "subscriptions", name: "Suscripciones", icon: CreditCard, href: "/dashboard/subscriptions" },
        { id: "referrals", name: "Referidos", icon: UserPlus, href: "/dashboard/referrals" },
        { id: "cases", name: "Mis Casos", icon: FileText, href: "/dashboard/cases" },
        { id: "quotes", name: "Citas", icon: CalendarDays, href: "/dashboard/quotes" },
        { id: "calendar", name: "Calendario", icon: Calendar, href: "/dashboard/calendar" },
        { id: "messages", name: "Mensajes", icon: MessageCircle, href: "/dashboard/messages" },
        ...baseItems.slice(1), // Keep settings
      ]
    }
  }

  const sidebarItems = getMenuItems()

  // Data for search functionality
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
    // Optionally navigate to the relevant page based on result.type and result.id
    // For example: router.push(`/dashboard/cases?id=${result.id}`);
    console.log("Resultado seleccionado:", result)
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

  return (
    <ProtectedRoute>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="border-b border-border/40 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
                >
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
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
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pathname.startsWith(item.href)
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
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
              {children}
              {/* Placeholder for sections not yet implemented */}
              {sidebarItems.find((item) => pathname.startsWith(item.href))?.id === "calendar" && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Vista en Desarrollo</h3>
                  <p className="text-muted-foreground">La sección "Calendario" estará disponible próximamente.</p>
                </div>
              )}
              {sidebarItems.find((item) => pathname.startsWith(item.href))?.id === "analytics" &&
                profile?.account_type === "advisor" && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Vista en Desarrollo</h3>
                    <p className="text-muted-foreground">La sección "Análisis" estará disponible próximamente.</p>
                  </div>
                )}
            </main>
          </div>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}
        </div>
      </Suspense>
    </ProtectedRoute>
  )
}
