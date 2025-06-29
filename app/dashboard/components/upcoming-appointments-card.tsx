"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarCheck } from "lucide-react"

interface Appointment {
  id: string
  title: string
  date: string
  time: string
  client?: string
}

interface UpcomingAppointmentsCardProps {
  appointments: Appointment[]
}

export function UpcomingAppointmentsCard({ appointments }: UpcomingAppointmentsCardProps) {
  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Próximas Citas</CardTitle>
        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay citas próximas.</p>
        ) : (
          <ul className="space-y-2">
            {appointments.slice(0, 3).map((appointment) => (
              <li key={appointment.id} className="text-sm">
                <p className="font-medium">{appointment.title}</p>
                <p className="text-muted-foreground">
                  {appointment.date} a las {appointment.time}
                  {appointment.client && ` con ${appointment.client}`}
                </p>
              </li>
            ))}
            {appointments.length > 3 && (
              <li className="text-sm text-muted-foreground">+{appointments.length - 3} más...</li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
