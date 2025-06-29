"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarComponent } from "@/components/calendar-component" // Assuming this component exists
import { XCircle, FileText } from "lucide-react"

export default function CalendarPage() {
  const { profile, loading } = useAuth()
  const [loadingCalendar, setLoadingCalendar] = useState(true)

  useEffect(() => {
    // Simulate loading calendar data
    setLoadingCalendar(true)
    setTimeout(() => {
      setLoadingCalendar(false)
    }, 1000)
  }, [profile])

  if (loading || loadingCalendar) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Cargando...</h3>
        <p className="text-muted-foreground">Cargando tu calendario.</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-foreground mb-2">Error de Autenticación</h3>
        <p className="text-muted-foreground">No se pudo cargar el perfil del usuario.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Mi Calendario</h2>
          <p className="text-muted-foreground">Gestiona tus citas y eventos importantes.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendario de Eventos</CardTitle>
          <CardDescription>Visualiza y organiza tus próximas citas y plazos.</CardDescription>
        </CardHeader>
        <CardContent>
          <CalendarComponent />
        </CardContent>
      </Card>
    </div>
  )
}
