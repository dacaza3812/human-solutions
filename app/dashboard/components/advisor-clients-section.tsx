"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, Users, FileText, CheckCircle, Award } from "lucide-react"
import { createClient } from "@/lib/supabase-server"

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

interface AdvisorClientsSectionProps {
  advisorClients: AdvisorClient[]
  advisorCases: AdvisorCase[] // Needed to find a case for chat
  selectedClient: AdvisorClient | null
  setSelectedClient: (client: AdvisorClient | null) => void
  clientFilter: string
  setClientFilter: (filter: string) => void
  openChatForCase: (caseId: number) => void
}

export default async function AdvisorClientsSection() {
  const supabase = createClient()
  // In a real app, you'd fetch clients associated with the advisor
  const { data: clients, error } = await supabase.from("profiles").select("id, full_name, avatar_url").limit(5)

  if (error) {
    console.error("Error fetching clients:", error)
    return <p>Error loading clients.</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Mis Clientes</h2>
          <p className="text-muted-foreground">Gestiona la información de tus clientes</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Buscar clientes..."
              className="pl-10 w-64"
              // value={clientFilter}
              // onChange={(e) => setClientFilter(e.target.value)}
            />
          </div>
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Client Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clientes</p>
                <p className="text-2xl font-bold text-foreground">{clients.length}</p>
                <p className="text-sm text-emerald-400">+2 este mes</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for other stats cards */}
        <Card className="border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Casos Activos</p>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-blue-400">En progreso</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Casos Completados</p>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-purple-400">Este mes</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satisfacción</p>
                <p className="text-2xl font-bold text-foreground">98%</p>
                <p className="text-sm text-orange-400">Promedio</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Grid */}
      <div className="grid gap-6">
        {clients.map((client) => (
          <Card
            key={client.id}
            className="border-border/40 cursor-pointer hover:shadow-md transition-shadow"
            // onClick={() => setSelectedClient(client)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={client.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{client.full_name ? client.full_name[0] : "CN"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{client.full_name || "Cliente Nuevo"}</h3>
                    {/* Placeholder for email and phone */}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Última actividad</p>
                  <p className="text-sm font-medium">2 días</p>
                </div>
              </div>

              {/* Placeholder for cases grid */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Client Detail Modal */}
      {/* Placeholder for client detail modal */}
    </div>
  )
}
