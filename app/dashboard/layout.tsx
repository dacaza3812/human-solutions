"use client"

import type React from "react"
import { useState, Fragment } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/auth-context" // Re-imported useAuth
import {
  Home,
  Users,
  FileText,
  Settings,
  MessageCircle,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  User,
  UserPlus,
  PieChart,
  CreditCard,
  Contact,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense } from "react"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface DashboardLayoutProps {
  children: React.ReactNode
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const { user, profile, signOut } = useAuth() // Re-introduced useAuth hook

  const pathname = usePathname()

  // Menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      { id: "overview", name: "Resumen", icon: Home, href: "/dashboard" },
      // { id: "test", name: "Prueba", icon: TestTube, href: "/dashboard/test" },
      { id: "settings", name: "Configuración", icon: Settings, href: "/dashboard/settings" },
    ]

    if (profile?.account_type === "advisor") {
      return [
        ...baseItems.slice(0, 1), // Keep overview
        { id: "clients", name: "Clientes", icon: Users, href: "/dashboard/clients" },
        { id: "cases", name: "Casos", icon: FileText, href: "/dashboard/cases" },
        { id: "financial", name: "Vista Financiera", icon: PieChart, href: "/dashboard/financial" },
        // { id: "analytics", name: "Análisis", icon: BarChart3, href: "/dashboard/analytics" },
        // { id: "calendar", name: "Calendario", icon: Calendar, href: "/dashboard/calendar" },
        { id: "messages", name: "Mensajes", icon: MessageCircle, href: "/dashboard/messages" },
        { id: "inquiries", name: "Contactos", icon: Contact, href: "/dashboard/inquiries" },
        ...baseItems.slice(1), // Keep test and settings
      ]
    } else {
      // Client menu
      return [
        ...baseItems.slice(0, 1), // Keep overview
        { id: "subscriptions", name: "Suscripciones", icon: CreditCard, href: "/dashboard/subscriptions" },
        { id: "referrals", name: "Referidos", icon: UserPlus, href: "/dashboard/referrals" },
        { id: "cases", name: "Mis Casos", icon: FileText, href: "/dashboard/cases" },
        // { id: "quotes", name: "Citas", icon: CalendarDays, href: "/dashboard/quotes" },
        // { id: "calendar", name: "Calendario", icon: Calendar, href: "/dashboard/calendar" },
        { id: "messages", name: "Mensajes", icon: MessageCircle, href: "/dashboard/messages" },
        ...baseItems.slice(1), // Keep test and settings
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

  // Check if current path matches menu item
  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
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
                <Link
                  key={item.id}
                  href={item.href}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActiveRoute(item.href)
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  onClick={() => setSidebarOpen(false)}
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
                onClick={signOut} // Re-connected signOut
              >
                <LogOut className="w-4 h-4 mr-3" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const pathSegments = pathname.split("/").filter(Boolean) // Remove empty strings

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Suspense fallback={null}>
              <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {pathSegments.slice(1).map((segment, index) => {
                      const href = "/" + pathSegments.slice(0, index + 2).join("/")
                      const isLast = index === pathSegments.slice(1).length - 1
                      const displayName = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")

                      return (
                        <Fragment key={segment}>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            {isLast ? (
                              <BreadcrumbPage>{displayName}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink asChild>
                                <Link href={href}>{displayName}</Link>
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                        </Fragment>
                      )
                    })}
                  </BreadcrumbList>
                </Breadcrumb>
              </header>
            </Suspense>
            <main className="flex-1 overflow-auto">
              <DashboardLayoutContent>{children}</DashboardLayoutContent>
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}
