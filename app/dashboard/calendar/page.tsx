"use client"

import { CalendarComponent } from "@/components/calendar-component"
import { useAuth } from "@/contexts/auth-context"
import { FileText } from "lucide-react"
import { useState } from "react"

export default function CalendarPage() {
  const { profile, loading } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Cargando...</h3>
        <p className="text-muted-foreground">Cargando calendario.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Calendario</h2>
          <p className="text-muted-foreground">Gestiona tus citas y eventos</p>
        </div>
      </div>
      <CalendarComponent selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
    </div>
  )
}
