"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UpcomingAppointmentsCardProps {
  upcomingAppointments: {
    title: string
    time: string
    description: string
    colorClass: string // e.g., "emerald", "blue", "purple"
  }[]
}

export function UpcomingAppointmentsCard({ upcomingAppointments }: UpcomingAppointmentsCardProps) {
  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="text-foreground">Próximas Citas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingAppointments.map((appointment, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border border-${appointment.colorClass}-500/20 bg-${appointment.colorClass}-500/5`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-foreground">{appointment.title}</p>
              <span className={`text-xs text-${appointment.colorClass}-400`}>{appointment.time}</span>
            </div>
            <p className="text-sm text-muted-foreground">{appointment.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
