"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, FileText, Percent } from "lucide-react"

interface StatsGridProps {
  profileType: "client" | "advisor" | null
}

export function StatsGrid({ profileType }: StatsGridProps) {
  const advisorStats = [
    { title: "Ingresos Totales", value: "$15,000", icon: DollarSign, description: "+20.1% desde el mes pasado" },
    { title: "Clientes Activos", value: "150", icon: Users, description: "+180.1% desde el mes pasado" },
    { title: "Casos Abiertos", value: "75", icon: FileText, description: "+19% desde el mes pasado" },
    { title: "Tasa de Éxito", value: "92%", icon: Percent, description: "+5% desde el año pasado" },
  ]

  const clientStats = [
    { title: "Casos en Progreso", value: "2", icon: FileText, description: "Actualizado hace 2 días" },
    { title: "Citas Próximas", value: "1", icon: Users, description: "Mañana a las 10 AM" },
    { title: "Ahorros Potenciales", value: "$5,000", icon: DollarSign, description: "Estimado por asesoría" },
    { title: "Referidos Activos", value: "3", icon: Percent, description: "Gana recompensas" },
  ]

  const stats = profileType === "advisor" ? advisorStats : clientStats

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 col-span-full">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
