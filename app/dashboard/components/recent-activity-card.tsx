"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"

interface ActivityItem {
  id: string
  description: string
  time: string
}

const mockActivities: ActivityItem[] = [
  { id: "1", description: "Actualización de caso #1234", time: "Hace 5 min" },
  { id: "2", description: "Nueva cita agendada", time: "Hace 1 hora" },
  { id: "3", description: "Documento subido al caso #5678", time: "Ayer" },
  { id: "4", description: "Mensaje de Juan Pérez", time: "Hace 2 días" },
]

export function RecentActivityCard() {
  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Actividad Reciente</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {mockActivities.map((activity) => (
            <li key={activity.id} className="flex items-center justify-between text-sm">
              <span>{activity.description}</span>
              <span className="text-muted-foreground">{activity.time}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
