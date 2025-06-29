"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

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
  clientFilter: string
  setClientFilter: (filter: string) => void
  setSelectedClient: (client: AdvisorClient | null) => void
  selectedClient: AdvisorClient | null
  advisorCases: AdvisorCase[]
  openChatForCase: (caseId: number) => void
}

export function AdvisorClientsSection({
  advisorClients,
  clientFilter,
  setClientFilter,
  setSelectedClient,
  selectedClient,
  advisorCases,
  openChatForCase,
}: AdvisorClientsSectionProps) {
  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false)

  const handleViewDetails = (client: AdvisorClient) => {
    setSelectedClient(client)
    setIsClientDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setSelectedClient(null)
    setIsClientDetailsOpen(false)
  }

  const filteredClients = advisorClients.filter(
    (client) =>
      client.name.toLowerCase().includes(clientFilter.toLowerCase()) ||
      client.email.toLowerCase().includes(clientFilter.toLowerCase()),
  )

  const clientCases = selectedClient ? advisorCases.filter((c) => c.clientId === selectedClient.id) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Mis Clientes</h2>
          <p className="text-muted-foreground">Gestiona la información y los casos de tus clientes.</p>
        </div>
      </div>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente por nombre o email..."
              className="pl-10"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Casos Activos</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Última Actividad</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b border-border/20 hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm font-medium flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={client.avatar || "/placeholder.svg"} alt={client.name} />
                        <AvatarFallback>{client.name[0]}</AvatarFallback>
                      </Avatar>
                      <span>{client.name}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{client.email}</td>
                    <td className="py-3 px-4 text-sm">
                      {client.activeCases} / {client.totalCases}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{client.lastActivity}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(client)}>
                        Ver Detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Client Details Dialog */}
      <Dialog open={isClientDetailsOpen} onOpenChange={setIsClientDetailsOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente: {selectedClient?.name}</DialogTitle>
            <DialogDescription>Información de contacto y casos asociados.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientName" className="text-right">
                Nombre
              </Label>
              <Input id="clientName" value={selectedClient?.name} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientEmail" className="text-right">
                Email
              </Label>
              <Input id="clientEmail" value={selectedClient?.email} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientPhone" className="text-right">
                Teléfono
              </Label>
              <Input id="clientPhone" value={selectedClient?.phone} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="joinDate" className="text-right">
                Fecha de Ingreso
              </Label>
              <Input id="joinDate" value={selectedClient?.joinDate} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastActivity" className="text-right">
                Última Actividad
              </Label>
              <Input id="lastActivity" value={selectedClient?.lastActivity} readOnly className="col-span-3" />
            </div>

            <h4 className="text-lg font-semibold mt-4 col-span-4">Casos del Cliente</h4>
            {clientCases.length > 0 ? (
              <div className="col-span-4 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Título</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Tipo</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Estado</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Progreso</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientCases.map((caseItem) => (
                      <tr key={caseItem.id} className="border-b border-border/20 hover:bg-muted/50">
                        <td className="py-2 px-3 text-sm font-medium">{caseItem.title}</td>
                        <td className="py-2 px-3 text-sm text-muted-foreground">{caseItem.type}</td>
                        <td className="py-2 px-3 text-sm">{caseItem.status}</td>
                        <td className="py-2 px-3 text-sm">
                          <Progress value={caseItem.progress} className="w-20" />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <Button variant="ghost" size="sm" onClick={() => openChatForCase(caseItem.id)}>
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="col-span-4 text-muted-foreground">No hay casos asociados a este cliente.</p>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={handleCloseDetails}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
