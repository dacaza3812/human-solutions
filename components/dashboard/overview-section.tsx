"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Users, FileText, DollarSign, Target, Award, UserPlus, CalendarIcon } from "lucide-react"

interface OverviewSectionProps {
  referralStats: {
    total_referrals: number
    active_referrals: number
    total_earnings: number
    monthly_earnings: number
  }
  userCases: any[]
}

export function OverviewSection({ referralStats, userCases }: OverviewSectionProps) {
  const { user, profile } = useAuth()

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
      value: userCases.filter((c) => c.status !== "Completada").length.toString(),
      change: "Esta semana",
      icon: CalendarIcon,
      color: "text-orange-400",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Bienvenido, {profile?.first_name}</h2>
          <p className="text-muted-foreground">Aquí tienes un resumen de tu actividad</p>
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
    </div>
  )
}
