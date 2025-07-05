"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, Users, FileText, CheckCircle, Award, MessageCircle, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase-server"
import { format } from "date-fns"
import { es } from "date-fns/locale"

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

export default async function AdvisorClientsSection({
  advisorClients,
  advisorCases,
  selectedClient,
  setSelectedClient,
  clientFilter,
  setClientFilter,
  openChatForCase,
}: AdvisorClientsSectionProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <p>Por favor, inicia sesión para ver tus clientes.</p>
  }

  // Fetch clients associated with the advisor's cases
  const { data: cases, error: casesError } = await supabase.from("cases").select("client_id").eq("advisor_id", user.id)

  if (casesError) {
    console.error("Error fetching cases for advisor clients:", casesError)
    return <p>Error al cargar los clientes: {casesError.message}</p>
  }

  const clientIds = Array.from(new Set(cases.map((c) => c.client_id)))

  if (clientIds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aún no tienes clientes asignados a tus casos.</p>
        </CardContent>
      </Card>
    )
  }

  const { data: clients, error: clientsError } = await supabase
    .from("profiles")
    .select("id, name, email, created_at")
    .in("id", clientIds)
    .order("created_at", { ascending: false })

  if (clientsError) {
    console.error("Error fetching client profiles:", clientsError)
    return <p>Error al cargar los clientes: {clientsError.message}</p>
  }

  const filteredClients = advisorClients.filter(
    (client) =>
      client.name.toLowerCase().includes(clientFilter.toLowerCase()) ||
      client.email.toLowerCase().includes(clientFilter.toLowerCase()),
  )

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
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
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
                <p className="text-2xl font-bold text-foreground">{advisorClients.length}</p>
                <p className="text-sm text-emerald-400">+2 este mes</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Casos Activos</p>
                <p className="text-2xl font-bold text-foreground">
                  {advisorClients.reduce((sum, client) => sum + client.activeCases, 0)}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  {advisorClients.reduce((sum, client) => sum + client.completedCases, 0)}
                </p>
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
        {filteredClients.map((client) => (
          <Card
            key={client.id}
            className="border-border/40 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedClient(client)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={client.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{client.name}</h3>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                    <p className="text-sm text-muted-foreground">{client.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Última actividad</p>
                  <p className="text-sm font-medium">{new Date(client.lastActivity).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/40">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{client.totalCases}</p>
                  <p className="text-xs text-muted-foreground">Total Casos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{client.activeCases}</p>
                  <p className="text-xs text-muted-foreground">Activos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">{client.completedCases}</p>
                  <p className="text-xs text-muted-foreground">Completados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedClient.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{selectedClient.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{selectedClient.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedClient(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{selectedClient.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                  <p className="font-medium">{new Date(selectedClient.joinDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Última Actividad</p>
                  <p className="font-medium">{new Date(selectedClient.lastActivity).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                    Activo
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card className="border-border/40">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{selectedClient.totalCases}</p>
                    <p className="text-sm text-muted-foreground">Total Casos</p>
                  </CardContent>
                </Card>
                <Card className="border-border/40">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-400">{selectedClient.activeCases}</p>
                    <p className="text-sm text-muted-foreground">Casos Activos</p>
                  </CardContent>
                </Card>
                <Card className="border-border/40">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-purple-400">{selectedClient.completedCases}</p>
                    <p className="text-sm text-muted-foreground">Completados</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex space-x-3">
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => {
                    // Find a case for this client to open chat
                    const clientCase = advisorCases.find((c) => c.clientId === selectedClient.id)
                    if (clientCase) {
                      openChatForCase(clientCase.id)
                      setSelectedClient(null)
                    }
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar Mensaje
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <FileText className="w-4 h-4 mr-2" />
                  Ver Casos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Miembro Desde</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{format(new Date(client.created_at), "PPP", { locale: es })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
