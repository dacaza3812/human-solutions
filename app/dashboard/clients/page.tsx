"use client"

import { useState } from "react"
import { AdvisorClientsSection } from "@/app/dashboard/components/advisor-clients-section"
import { useAuth } from "@/contexts/auth-context"
import { FileText } from "lucide-react"

// Define tipos para los datos mock
interface AdvisorClient {
  id: number
  name: string
  email: string
  phone: string
  avatar: string
  totalCases: number
  activeCases: number
  completedCases: number
  joinDate: string
  lastActivity: string
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

export default function ClientsPage() {
  const { profile, loading } = useAuth()
  const [clientFilter, setClientFilter] = useState("")
  const [selectedClient, setSelectedClient] = useState<AdvisorClient | null>(null)

  // Mock data for advisor's clients
  const advisorClients: AdvisorClient[] = [
    {
      id: 1,
      name: "Juan Pérez",
      email: "juan@email.com",
      phone: "+52 123 456 7890",
      avatar: "/placeholder-user.jpg",
      totalCases: 3,
      activeCases: 2,
      completedCases: 1,
      joinDate: "2024-01-10",
      lastActivity: "2024-01-18",
    },
    {
      id: 2,
      name: "María López",
      email: "maria@email.com",
      phone: "+52 098 765 4321",
      avatar: "/placeholder-user.jpg",
      totalCases: 2,
      activeCases: 1,
      completedCases: 1,
      joinDate: "2024-01-05",
      lastActivity: "2024-01-17",
    },
    {
      id: 3,
      name: "Carlos Mendoza",
      email: "carlos@email.com",
      phone: "+52 555 123 4567",
      avatar: "/placeholder-user.jpg",
      totalCases: 4,
      activeCases: 3,
      completedCases: 1,
      joinDate: "2023-12-15",
      lastActivity: "2024-01-19",
    },
  ]

  // Mock data for advisor's cases (needed for client details view)
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
        <p className="text-muted-foreground">Cargando información de clientes.</p>
      </div>
    )
  }

  if (profile?.account_type !== "advisor") {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Acceso Restringido</h3>
        <p className="text-muted-foreground">Esta sección está disponible solo para asesores.</p>
      </div>
    )
  }

  return (
    <AdvisorClientsSection
      advisorClients={advisorClients}
      clientFilter={clientFilter}
      setClientFilter={setClientFilter}
      setSelectedClient={setSelectedClient}
      selectedClient={selectedClient}
      advisorCases={advisorCases}
      openChatForCase={openChatForCase}
    />
  )
}
