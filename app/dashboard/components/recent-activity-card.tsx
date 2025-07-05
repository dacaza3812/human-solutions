"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CheckCircle, DollarSign, Calendar, UserPlus } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface ActivityItem {
  id: number
  type: "Nuevo Cliente" | "Caso Completado" | "Pago Recibido" | "Consulta Programada"
  description: string
  time: string
  status: "success" | "completed" | "payment" | "scheduled"
}

const recentActivityData: ActivityItem[] = [
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

export function RecentActivityCard() {
  const getIcon = (status: ActivityItem["status"]) => {
    switch (status) {
      case "success":
        return <UserPlus className="h-5 w-5 text-green-500" />
      case "completed":
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case "payment":
        return <DollarSign className="h-5 w-5 text-purple-500" />
      case "scheduled":
        return <Calendar className="h-5 w-5 text-orange-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {recentActivityData.map((activity, index) => (
          <div key={activity.id}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                {getIcon(activity.status)}
              </div>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">{activity.type}</p>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
              <div className="ml-auto text-xs text-muted-foreground">{activity.time}</div>
            </div>
            {index < recentActivityData.length - 1 && <Separator className="my-4" />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
