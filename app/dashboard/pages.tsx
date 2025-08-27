"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Home, Users, FileText, Calendar, MessageSquare, DollarSign, BarChart3, UserPlus, Settings } from "lucide-react"

// Import page components
import DashboardOverview from "./page"
import ClientsPage from "./clients/page"
import CasesPage from "./cases/page"
import CalendarPage from "./calendar/page"
import MessagesPage from "./messages/page"
import FinancialPage from "./financial/page"
import AnalyticsPage from "./analytics/page"
import ReferralsPage from "./referrals/page"
import SettingsPage from "./settings/page"
import PostsPage from "./posts/page"

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    component: DashboardOverview,
    roles: ["client", "advisor"],
  },
  {
    id: "clients",
    label: "Clientes",
    icon: Users,
    component: ClientsPage,
    roles: ["advisor"],
  },
  {
    id: "cases",
    label: "Casos",
    icon: FileText,
    component: CasesPage,
    roles: ["client", "advisor"],
  },
  {
    id: "calendar",
    label: "Calendario",
    icon: Calendar,
    component: CalendarPage,
    roles: ["client", "advisor"],
  },
  {
    id: "messages",
    label: "Mensajes",
    icon: MessageSquare,
    component: MessagesPage,
    roles: ["client", "advisor"],
  },
  {
    id: "financial",
    label: "Financiero",
    icon: DollarSign,
    component: FinancialPage,
    roles: ["advisor"],
  },
  {
    id: "analytics",
    label: "Analíticas",
    icon: BarChart3,
    component: AnalyticsPage,
    roles: ["advisor"],
  },
  {
    id: "referrals",
    label: "Referencias",
    icon: UserPlus,
    component: ReferralsPage,
    roles: ["client", "advisor"],
  },
  {
    id: "posts",
    label: "Posts",
    icon: PostsPage,
    component: PostsPage,
    roles: ["advisor"],
  },
  {
    id: "settings",
    label: "Configuración",
    icon: Settings,
    component: SettingsPage,
    roles: ["client", "advisor"],
  },
]

export default function DashboardPages() {
  const [activeView, setActiveView] = useState("dashboard")
  const [notifications, setNotifications] = useState({})
  const { profile, loading } = useAuth()

  useEffect(() => {
    if (profile) {
      fetchNotifications()
    }
  }, [profile])

  const fetchNotifications = async () => {
    try {
      // Fetch unread messages count
      const { count: messagesCount } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .neq("sender_id", profile?.id)

      // Fetch pending cases count (for advisors)
      let casesCount = 0
      if (profile?.account_type === "advisor") {
        const { count } = await supabase
          .from("cases")
          .select("*", { count: "exact", head: true })
          .eq("status", "pendiente")
        casesCount = count || 0
      }

      setNotifications({
        messages: messagesCount || 0,
        cases: casesCount,
      })
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const getFilteredMenuItems = () => {
    if (!profile) return []

    return menuItems.filter((item) => item.roles.includes(profile.account_type || "client"))
  }

  const ActiveComponent = menuItems.find((item) => item.id === activeView)?.component || DashboardOverview

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {profile?.account_type === "advisor" ? "Panel de Asesor" : "Panel de Cliente"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {profile?.first_name} {profile?.last_name}
          </p>
        </div>

        <Separator />

        <nav className="p-4 space-y-2">
          {getFilteredMenuItems().map((item) => {
            const Icon = item.icon
            const hasNotification = notifications[item.id] > 0

            return (
              <Button
                key={item.id}
                variant={activeView === item.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  activeView === item.id && "bg-blue-50 text-blue-700 border-blue-200",
                )}
                onClick={() => setActiveView(item.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
                {hasNotification && (
                  <Badge variant="destructive" className="ml-auto">
                    {notifications[item.id]}
                  </Badge>
                )}
              </Button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <ActiveComponent />
        </div>
      </div>
    </div>
  )
}
