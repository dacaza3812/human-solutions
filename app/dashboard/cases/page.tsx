"use client"

import { useState } from "react"
import { ClientCasesSection } from "@/app/dashboard/components/client-cases-section"
import { AdvisorCasesSection } from "@/app/dashboard/components/advisor-cases-section"
import { useAuth } from "@/contexts/auth-context"
import { FileText } from "lucide-react"

// Define tipos para los datos mock
interface ClientCase {
  id: number
  title: string
  type: string
  status: string
  advisor: string
  advisorAvatar: string
  description: string
  createdDate: string
  nextAppointment: string | null
  progress: number
}

interface AdvisorCase {
  id: number
  clientName: string
  clientId: number
  title: string
  type: string
  status: string
  priority: string
  createdDate: string
  dueDate: string
  description: string
  progress: number
}

export default function CasesPage() {
  const { profile, loading } = useAuth()
  const [selectedCase, setSelectedCase] = useState<AdvisorCase | null>(null)
  const [caseFilter, setCaseFilter] = useState("all")

  // Mock data for current user's cases (client view)
  const userCases: ClientCase[] = [
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
  const advisorCases: AdvisorCase[] = [
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
    // In a real app, this would navigate to the messages page with the caseId
    console.log(`Opening chat for case ID: ${caseId}`)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Cargando...</h3>
        <p className="text-muted-foreground">Cargando información de casos.</p>
      </div>
    )
  }

  return (
    <>
      {profile?.account_type === "client" && (
        <ClientCasesSection userCases={userCases} openChatForCase={openChatForCase} />
      )}

      {profile?.account_type === "advisor" && (
        <AdvisorCasesSection
          advisorCases={advisorCases}
          caseFilter={caseFilter}
          setCaseFilter={setCaseFilter}
          setSelectedCase={setSelectedCase}
          openChatForCase={openChatForCase}
          selectedCase={selectedCase}
          setSelectedClient={() => {}} // This prop is not used in AdvisorCasesSection directly
        />
      )}
    </>
  )
}
