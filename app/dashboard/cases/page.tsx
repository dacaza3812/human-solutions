"use client"

import { useState } from "react"
import { ClientCasesSection } from "../components/client-cases-section"
import { AdvisorCasesSection } from "../components/advisor-cases-section"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function CasesPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [caseFilter, setCaseFilter] = useState("all")
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [setSelectedClient] = useState<any>(null)

  // Mock data for current user's cases (client view)
  const userCases = [
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
    {
      id: 3,
      title: "Consulta Legal",
      type: "Asesoría Legal",
      status: "Completada",
      advisor: "Abg. Ana Martínez",
      advisorAvatar: "/placeholder-user.jpg",
      description: "Consulta sobre derechos laborales y procedimientos legales.",
      createdDate: "2023-12-20",
      nextAppointment: null,
      progress: 100,
    },
  ]

  // Mock data for advisor's cases
  const advisorCases = [
    {
      id: 1,
      clientName: "Juan Pérez",
      clientId: 1,
      title: "Asesoría Financiera Personal",
      type: "Asesoría Financiera",
      status: "En Progreso",
      priority: "Alta",
      createdDate: "2024-01-15",
      dueDate: "2024-02-15",
      description:
        "Planificación presupuestaria y estrategias de ahorro para mejorar la situación financiera familiar.",
      progress: 65,
    },
    {
      id: 2,
      clientName: "María López",
      clientId: 2,
      title: "Mediación Familiar",
      type: "Relaciones Familiares",
      status: "Programada",
      priority: "Media",
      createdDate: "2024-01-10",
      dueDate: "2024-01-30",
      description: "Resolución de conflictos familiares y mejora de la comunicación.",
      progress: 25,
    },
    {
      id: 3,
      clientName: "Carlos Mendoza",
      clientId: 3,
      title: "Consulta Legal",
      type: "Asesoría Legal",
      status: "En Revisión",
      priority: "Baja",
      createdDate: "2024-01-08",
      dueDate: "2024-01-25",
      description: "Consulta sobre derechos laborales y procedimientos legales.",
      progress: 80,
    },
  ]

  const openChatForCase = (caseId: number) => {
    router.push(`/dashboard/messages?case=${caseId}`)
  }

  if (profile?.account_type === "client") {
    return <ClientCasesSection userCases={userCases} openChatForCase={openChatForCase} />
  } else if (profile?.account_type === "advisor") {
    return (
      <AdvisorCasesSection
        advisorCases={advisorCases}
        caseFilter={caseFilter}
        setCaseFilter={setCaseFilter}
        setSelectedCase={setSelectedCase}
        openChatForCase={openChatForCase}
        selectedCase={selectedCase}
        setSelectedClient={setSelectedClient}
      />
    )
  }

  return null
}
