"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  Calendar,
  CaseSensitive,
  LineChartIcon as ChartLine,
  CircleDollarSign,
  FileText,
  Handshake,
  Mail,
  Menu,
  Users,
  X,
  Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route" // Corrected import to named export
import { supabase } from "@/lib/supabase"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut, loading: authLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [referralStats, setReferralStats] = useState({ total_referred: 0, active_referred: 0 })
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (profile?.account_type === "advisor") {
      fetchReferralStats()
    } else {
      setStatsLoading(false)
    }
  }, [profile])

  const fetchReferralStats = async () => {
    setStatsLoading(true)
    try {
      const { data, error } = await supabase.rpc("get_referral_stats")
      if (error) {
        console.error("Error fetching referral stats:", error)
      } else {
        setReferralStats(data || { total_referred: 0, active_referred: 0 })
      }
    } catch (error) {
      console.error("Unexpected error fetching referral stats:", error)
    } finally {
      setStatsLoading(false)
    }
  }

  const navigationItems = [
    {
      name: "Resumen",
      href: "/dashboard/summary",
      icon: Home,
      roles: ["client", "advisor"],
    },
    {
      name: "Suscripciones",
      href: "/dashboard/subscriptions",
      icon: CircleDollarSign,
      roles: ["client"],
    },
    {
      name: "Referidos",
      href: "/dashboard/referrals",
      icon: Handshake,
      roles: ["client"],
    },
    {
      name: "Casos",
      href: "/dashboard/cases",
      icon: CaseSensitive,
      roles: ["client", "advisor"],
    },
    {
      name: "Citas/Cotizaciones",
      href: "/dashboard/quotes",
      icon: Calendar,
      roles: ["client"],
    },
    {
      name: "Clientes",
      href: "/dashboard/clients",
      icon: Users,
      roles: ["advisor"],
    },
    {
      name: "Mensajes",
      href: "/dashboard/messages",
      icon: Mail,
      roles: ["client", "advisor"],
    },
    {
      name: "Financiero",
      href: "/dashboard/financial",
      icon: ChartLine,
      roles: ["advisor"],
    },
    {
      name: "Configuración",
      href: "/dashboard/settings",
      icon: FileText,
      roles: ["client", "advisor"],
    },
    {
      name: "Calendario",
      href: "/dashboard/calendar",
      icon: Calendar,
      roles: ["client", "advisor"],
    },
    {
      name: "Analíticas",
      href: "/dashboard/analytics",
      icon: ChartLine,
      roles: ["advisor"],
    },
  ]

  const filteredNavigation = navigationItems.filter((item) => item.roles.includes(profile?.account_type || ""))

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-[60px] items-center border-b px-6">
              <Link className="flex items-center gap-2 font-semibold" href="/dashboard/summary">
                <img src="/fox-lawyer-logo.png" alt="Fox Lawyer Logo" className="h-6 w-6" />
                <span className="">Fox Lawyer</span>
              </Link>
              <Button className="ml-auto h-8 w-8 bg-transparent" size="icon" variant="outline">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Toggle notifications</span>
              </Button>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-4 text-sm font-medium">
                <TooltipProvider>
                  {filteredNavigation.map((item) => (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        <Link
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
                            pathname === item.href ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-50" : ""
                          }`}
                          href={item.href}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.name}</TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </nav>
            </div>
            {profile?.account_type === "advisor" && (
              <div className="mt-auto p-4 border-t">
                <h3 className="text-lg font-semibold mb-2">Estadísticas de Referidos</h3>
                {statsLoading ? (
                  <p className="text-sm text-muted-foreground">Cargando estadísticas...</p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Total Referidos: {referralStats.total_referred}</p>
                    <p className="text-sm text-muted-foreground">Referidos Activos: {referralStats.active_referred}</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button className="lg:hidden bg-transparent" size="icon" variant="outline">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <div className="flex h-[60px] items-center border-b px-6">
                  <Link className="flex items-center gap-2 font-semibold" href="/dashboard/summary">
                    <img src="/fox-lawyer-logo.png" alt="Fox Lawyer Logo" className="h-6 w-6" />
                    <span className="">Fox Lawyer</span>
                  </Link>
                  <Button
                    className="ml-auto h-8 w-8 bg-transparent"
                    size="icon"
                    variant="outline"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </div>
                <div className="flex-1 overflow-auto py-2">
                  <nav className="grid items-start px-4 text-sm font-medium">
                    {filteredNavigation.map((item) => (
                      <Link
                        key={item.name}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
                          pathname === item.href ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-50" : ""
                        }`}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1">{/* Search or other header content */}</div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="rounded-full border border-gray-200 w-8 h-8 dark:border-gray-800"
                  size="icon"
                  variant="ghost"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage alt="User Avatar" src="/placeholder-user.jpg" />
                    <AvatarFallback>{profile?.first_name ? profile.first_name[0] : "U"}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {profile?.first_name} {profile?.last_name}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>Configuración</DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>Cerrar Sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
