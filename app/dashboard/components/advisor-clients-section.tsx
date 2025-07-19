"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Users, UserCheck, Calendar, TrendingUp, Phone, Mail, MessageSquare } from "lucide-react"
import type { ClientStats, ClientData } from "@/actions/advisor-clients"

interface AdvisorClientsSectionProps {
  stats: ClientStats
  clients: ClientData[]
}

export function AdvisorClientsSection({ stats, clients }: AdvisorClientsSectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null)

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Activo
          </Badge>
        )
      case "inactive":
        return <Badge variant="secondary">Inactivo</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>
      case "past_due":
        return <Badge variant="destructive">Vencido</Badge>
      case "trialing":
        return <Badge className="bg-blue-100 text-blue-800">Prueba</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const getPlanBadge = (plan: string | null) => {
    if (!plan) return <Badge variant="outline">Sin plan</Badge>

    switch (plan.toLowerCase()) {
      case "standard":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            Estándar
          </Badge>
        )
      case "premium":
        return (
          <Badge variant="default" className="bg-purple-100 text-purple-800">
            Premium
          </Badge>
        )
      case "collaborative":
        return (
          <Badge variant="default" className="bg-orange-100 text-orange-800">
            Colaborativo
          </Badge>
        )
      default:
        return <Badge variant="outline">{plan}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Tarjetas de Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Usuarios registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClients}</div>
            <p className="text-xs text-muted-foreground">Con suscripción activa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes de {stats.currentMonth}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyClients}</div>
            <p className="text-xs text-muted-foreground">Registrados este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retención</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.retentionRate}%</div>
            <p className="text-xs text-muted-foreground">Usuarios con plan</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Clientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Clientes Activos</CardTitle>
              <CardDescription>Lista de clientes con suscripción activa</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Casos</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchTerm ? "No se encontraron clientes" : "No hay clientes activos"}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow
                    key={client.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedClient(client)}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={client.avatar || undefined} alt={client.name} />
                          <AvatarFallback>
                            {client.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground">{client.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getPlanBadge(client.subscriptionPlan)}</TableCell>
                    <TableCell>{getStatusBadge(client.subscriptionStatus)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Total: {client.totalCases}</div>
                        <div className="text-muted-foreground">
                          Activos: {client.activeCases} | Completados: {client.completedCases}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(client.joinDate)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedClient(client)
                        }}
                      >
                        Ver detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Detalles del Cliente */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
            <DialogDescription>Información completa del cliente seleccionado</DialogDescription>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-6">
              {/* Información Personal */}
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedClient.avatar || undefined} alt={selectedClient.name} />
                  <AvatarFallback className="text-lg">
                    {selectedClient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedClient.name}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{selectedClient.email}</span>
                    </div>
                    {selectedClient.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{selectedClient.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Información de Suscripción */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Estado de Suscripción</label>
                  <div className="mt-1">{getStatusBadge(selectedClient.subscriptionStatus)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Plan</label>
                  <div className="mt-1">{getPlanBadge(selectedClient.subscriptionPlan)}</div>
                </div>
              </div>

              {/* Estadísticas de Casos */}
              <div>
                <label className="text-sm font-medium mb-2 block">Estadísticas de Casos</label>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">{selectedClient.totalCases}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedClient.activeCases}</div>
                      <div className="text-sm text-muted-foreground">Activos</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedClient.completedCases}</div>
                      <div className="text-sm text-muted-foreground">Completados</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Fecha de Registro</label>
                  <div className="mt-1 text-sm">{formatDate(selectedClient.joinDate)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Última Actividad</label>
                  <div className="mt-1 text-sm">{formatDate(selectedClient.lastActivity)}</div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex space-x-2 pt-4 border-t">
                <Button variant="outline" className="flex-1 bg-transparent">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Enviar Mensaje
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
