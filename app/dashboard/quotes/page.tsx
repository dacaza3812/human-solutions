"use client"

import { useState } from "react"
import { Suspense } from "react"
import QuotesSection from "../components/quotes-section"
import { CalendarDays, Video, Phone, MapPin } from "lucide-react"

export default function QuotesPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const appointments = [
    {
      id: 1,
      title: "Consulta Financiera",
      type: "Asesoría Financiera",
      client: "Ana Martínez",
      advisor: "Dr. María González",
      date: "2024-01-25",
      time: "10:00 AM",
      duration: 60,
      status: "Confirmada",
      mode: "Videollamada",
      description: "Revisión de planificación presupuestaria y estrategias de ahorro",
      location: "Online",
      notes: "Cliente requiere documentos adicionales",
    },
    {
      id: 2,
      title: "Mediación Familiar",
      type: "Relaciones Familiares",
      client: "Familia Rodríguez",
      advisor: "Lic. Carlos Rodríguez",
      date: "2024-01-25",
      time: "2:30 PM",
      duration: 90,
      status: "Pendiente",
      mode: "Presencial",
      description: "Sesión de mediación para resolución de conflictos familiares",
      location: "Oficina Central - Sala 3",
      notes: "Ambas partes confirmaron asistencia",
    },
    {
      id: 3,
      title: "Consulta Legal",
      type: "Asesoría Legal",
      client: "Luis Fernández",
      advisor: "Abg. Ana Martínez",
      date: "2024-01-26",
      time: "11:00 AM",
      duration: 45,
      status: "Confirmada",
      mode: "Telefónica",
      description: "Consulta sobre derechos laborales y procedimientos legales",
      location: "Llamada telefónica",
      notes: "Preparar documentación legal relevante",
    },
    {
      id: 4,
      title: "Seguimiento Terapia",
      type: "Relaciones Familiares",
      client: "Roberto Silva",
      advisor: "Dra. Carmen Ruiz",
      date: "2024-01-26",
      time: "4:00 PM",
      duration: 60,
      status: "Cancelada",
      mode: "Videollamada",
      description: "Sesión de seguimiento de terapia de pareja",
      location: "Online",
      notes: "Cliente solicitó reprogramar",
    },
    {
      id: 5,
      title: "Planificación Patrimonial",
      type: "Asesoría Financiera",
      client: "Sofia Herrera",
      advisor: "Dr. Luis Fernández",
      date: "2024-01-27",
      time: "9:00 AM",
      duration: 120,
      status: "Confirmada",
      mode: "Presencial",
      description: "Revisión de estructura patrimonial y planificación sucesoria",
      location: "Oficina Central - Sala 1",
      notes: "Traer documentos patrimoniales actualizados",
    },
  ]

  const appointmentStats = {
    total: appointments.length,
    confirmed: appointments.filter((a) => a.status === "Confirmada").length,
    pending: appointments.filter((a) => a.status === "Pendiente").length,
    cancelled: appointments.filter((a) => a.status === "Cancelada").length,
  }

  const todayAppointments = appointments.filter((apt) => apt.date === "2024-01-25")
  const upcomingAppointments = appointments.filter((apt) => new Date(apt.date) > new Date("2024-01-25"))

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmada":
        return "bg-green-50 text-green-700 border-green-200"
      case "Pendiente":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "Cancelada":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "Videollamada":
        return <Video className="w-4 h-4" />
      case "Telefónica":
        return <Phone className="w-4 h-4" />
      case "Presencial":
        return <MapPin className="w-4 h-4" />
      default:
        return <CalendarDays className="w-4 h-4" />
    }
  }

  return (
    <div className="grid gap-6 p-6 md:p-8">
      <h1 className="text-3xl font-bold">Mis Cotizaciones</h1>
      <Suspense
        fallback={
          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <div className="h-8 w-48 bg-muted rounded" />
            </div>
            <div className="bg-card p-4 rounded-lg shadow">
              <div className="h-6 w-full bg-muted rounded mb-4" />
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 w-1/3 bg-muted rounded" />
                    <div className="h-4 w-1/4 bg-muted rounded" />
                    <div className="h-4 w-1/6 bg-muted rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      >
        <QuotesSection />
      </Suspense>
    </div>
  )
}
