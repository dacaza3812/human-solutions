"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { supabaseService } from "@/lib/supabase"

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

function DashboardContent() {
  const [activeView, setActiveView] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [referralStats, setReferralStats] = useState({
    total_referrals: 0,
    active_referrals: 0,
    total_earnings: 0,
    monthly_earnings: 0,
  })
  const [referralCode, setReferralCode] = useState("")
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(false)
  const [paymentHistory, setPaymentHistory] = useState<any[]>([])
  const [loadingPayments, setLoadingPayments] = useState(false)
  const { user, profile, signOut } = useAuth()

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
