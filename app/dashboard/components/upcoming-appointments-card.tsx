"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

interface Appointment {
  title: string
  time: string
  description: string
  colorClass: "emerald" | "blue" | "purple" | "orange"
}

interface UpcomingAppointmentsCardProps {
  upcomingAppointments: Appointment[]
}

export function UpcomingAppointmentsCard({ upcomingAppointments }: UpcomingAppointmentsCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "emerald":
        return "bg-emerald-500"
      case "blue":
        return "bg-blue-500"
      case "purple":
        return "bg-purple-500"
      case "orange":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle>Próximas Citas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingAppointments.map((appointment, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className={`w-3 h-3 rounded-full mt-1 ${getColorClasses(appointment.colorClass)}`} />
              <div>
                <p className="font-medium text-foreground">{appointment.title}</p>
                <p className="text-sm text-muted-foreground">{appointment.description}</p>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{appointment.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
