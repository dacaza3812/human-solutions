"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarComponent } from "@/components/calendar-component"

interface Appointment {
  id: string
  title: string
  date: string
  time: string
  client?: string
  advisor?: string
}

export default function CalendarPage() {
  const { profile, loading: authLoading } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && profile) {
      fetchAppointments()
    }
  }, [profile, authLoading])

  const fetchAppointments = async () => {
    setLoading(true)
    setError(null)
    try {
      // Simulate fetching appointments based on profile type
      if (profile?.account_type === "advisor") {
        setAppointments([
          { id: "a1", title: "Reunión con Juan Pérez", date: "2024-06-01", time: "10:00 AM", client: "Juan Pérez" },
          { id: "a2", title: "Consulta Ana López", date: "2024-06-02", time: "02:00 PM", client: "Ana López" },
          { id: "a3", title: "Cita con Carlos García", date: "2024-06-05", time: "09:00 AM", client: "Carlos García" },
        ])
      } else {
        // Client's appointments
        setAppointments([
          { id: "a4", title: "Cita con Abogado Smith", date: "2024-06-05", time: "11:00 AM", advisor: "Dr. Smith" },
          {
            id: "a5",
            title: "Revisión de Caso con Dra. García",
            date: "2024-06-07",
            time: "03:00 PM",
            advisor: "Dra. García",
          },
        ])
      }
    } catch (err) {
      console.error("Failed to fetch appointments:", err)
      setError("Failed to load appointments. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Calendario</h1>

      <Card>
        <CardHeader>
          <CardTitle>Tus Citas</CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarComponent />
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Próximas Citas</h3>
            {appointments.length === 0 ? (
              <p className="text-muted-foreground">No tienes citas próximas.</p>
            ) : (
              <ul className="space-y-2">
                {appointments.map((appt) => (
                  <li key={appt.id} className="border-b pb-2 last:border-b-0">
                    <p className="font-medium">{appt.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {appt.date} a las {appt.time}
                      {appt.client && ` con ${appt.client}`}
                      {appt.advisor && ` (Asesor: ${appt.advisor})`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
