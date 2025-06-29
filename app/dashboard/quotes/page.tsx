"use client"

import { useState } from "react"
import { QuotesSection } from "../components/quotes-section"
import { useAuth } from "@/contexts/auth-context"
import { FileText } from "lucide-react"

export default function QuotesPage() {
  const { profile } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Mock data for user's scheduled cases
  const userScheduledCases = [
    {
      id: 1,
      title: "Asesoría Financiera Personal",
      type: "Asesoría Financiera",
      status: "En Progreso",
      advisor: "Dr. María González",
      advisorAvatar: "/placeholder-user.jpg",
      description:
        "Planificación presupuestaria y estrategias de ahorro para mejorar la situación financiera familiar.",
      createdDate: "2024-01-15",
      nextAppointment: "2024-01-25 10:00 AM",
      progress: 65,
    },
    {
      id: 2,
      title: "Mediación Familiar",
      type: "Relaciones Familiares",
      status: "Programada",
      advisor: "Lic. Carlos Rodríguez",
      advisorAvatar: "/placeholder-user.jpg",
      description: "Resolución de conflictos familiares y mejora de la comunicación entre miembros de la familia.",
      createdDate: "2024-01-10",
      nextAppointment: "2024-01-20 2:30 PM",
      progress: 25,
    },
  ]

  if (profile?.account_type !== "client") {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Acceso Restringido</h3>
        <p className="text-muted-foreground">Esta sección está disponible solo para clientes.</p>
      </div>
    )
  }

  return (
    <QuotesSection
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      userScheduledCases={userScheduledCases}
    />
  )
}
