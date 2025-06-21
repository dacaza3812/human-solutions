"use client"

import { Calendar } from "@/components/calendar-component"

export function CalendarSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Calendario</h2>
          <p className="text-muted-foreground">Visualiza y gestiona tu agenda</p>
        </div>
      </div>
      <Calendar />
    </div>
  )
}
