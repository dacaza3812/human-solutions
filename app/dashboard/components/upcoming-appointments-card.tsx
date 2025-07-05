"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, User } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface Appointment {
  title: string
  time: string
  description: string
  colorClass: string // e.g., "emerald", "blue", "purple"
}

const upcomingAppointmentsData: Appointment[] = [
  {
    title: "Consulta Financiera",
    time: "10:00 AM",
    description: "Ana Martínez - Planificación presupuestaria",
    colorClass: "emerald",
  },
  {
    title: "Mediación Familiar",
    time: "2:30 PM",
    description: "Familia Rodríguez - Resolución de conflictos",
    colorClass: "blue",
  },
  {
    title: "Consulta Profesional",
    time: "4:00 PM",
    description: "Luis Fernández - Asesoría empresarial",
    colorClass: "purple",
  },
]

export function UpcomingAppointmentsCard() {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "emerald":
        return "text-emerald-500 bg-emerald-100 dark:bg-emerald-800 dark:text-emerald-100"
      case "blue":
        return "text-blue-500 bg-blue-100 dark:bg-blue-800 dark:text-blue-100"
      case "purple":
        return "text-purple-500 bg-purple-100 dark:bg-purple-800 dark:text-purple-100"
      default:
        return "text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximas Citas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {upcomingAppointmentsData.map((appointment, index) => (
          <div key={index}>
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${getColorClasses(appointment.colorClass)}`}
              >
                <Calendar className="h-5 w-5" />
              </div>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">{appointment.title}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {appointment.time}
                  <Separator orientation="vertical" className="h-3 mx-1" />
                  <User className="h-3 w-3" /> {appointment.description}
                </p>
              </div>
            </div>
            {index < upcomingAppointmentsData.length - 1 && <Separator className="my-4" />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
