"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
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
} from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function Dashboard() {
  const [activeView, setActiveView] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const sidebarItems = [
    { id: "overview", name: "Resumen", icon: Home },
    { id: "clients", name: "Clientes", icon: Users },
    { id: "cases", name: "Casos", icon: FileText },
    { id: "analytics", name: "Análisis", icon: BarChart3 },
    { id: "calendar", name: "Calendario", icon: Calendar },
    { id: "messages", name: "Mensajes", icon: MessageCircle },
    { id: "settings", name: "Configuración", icon: Settings },
  ]

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
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <img src="/fox-lawyer-logo.png" alt="Fox Lawyer" className="w-8 h-8" />
              <h1 className="text-xl font-bold text-foreground">Fox Lawyer Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar..." className="w-64" />
            </div>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                >
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500 hover:text-white"
                >
                  Registro
                </Button>
              </Link>
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

            <nav className="flex-1 px-4 space-y-2">
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
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
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
                  <h2 className="text-3xl font-bold text-foreground">Resumen General</h2>
                  <p className="text-muted-foreground">Bienvenido de vuelta, aquí tienes un resumen de tu actividad</p>
                </div>
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Caso
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index} className="border-border/40">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.title}</p>
                          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                          <p className={`text-sm ${stat.color}`}>{stat.change} vs mes anterior</p>
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

          {activeView !== "overview" && (
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
