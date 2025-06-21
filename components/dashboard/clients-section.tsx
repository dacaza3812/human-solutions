"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Eye, MessageCircle } from "lucide-react"

interface Client {
  id: number
  name: string
  email: string
  phone: string
  avatar: string
  status: string
  joinDate: string
  totalCases: number
  activeCases: number
  lastContact: string
  plan: string
  totalPaid: number
}

interface ClientsSectionProps {
  clients?: Client[]
}

export function ClientsSection({ clients = [] }: ClientsSectionProps) {
  const [clientFilter, setClientFilter] = useState("")

  // Mock data for advisor's clients
  const advisorClients: Client[] =
    clients.length > 0
      ? clients
      : [
          {
            id: 1,
            name: "Juan Pérez",
            email: "juan.perez@email.com",
            phone: "+1 234 567 8901",
            avatar: "/placeholder-user.jpg",
            status: "Activo",
            joinDate: "2024-01-15",
            totalCases: 3,
            activeCases: 1,
            lastContact: "2024-01-20",
            plan: "Premium",
            totalPaid: 450,
          },
          {
            id: 2,
            name: "María García",
            email: "maria.garcia@email.com",
            phone: "+1 234 567 8902",
            avatar: "/placeholder-user.jpg",
            status: "Activo",
            joinDate: "2024-01-10",
            totalCases: 2,
            activeCases: 2,
            lastContact: "2024-01-19",
            plan: "Standard",
            totalPaid: 180,
          },
          {
            id: 3,
            name: "Carlos López",
            email: "carlos.lopez@email.com",
            phone: "+1 234 567 8903",
            avatar: "/placeholder-user.jpg",
            status: "Inactivo",
            joinDate: "2023-12-01",
            totalCases: 5,
            activeCases: 0,
            lastContact: "2024-01-05",
            plan: "Collaborative",
            totalPaid: 890,
          },
        ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "activo":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
      case "inactivo":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Gestión de Clientes</h2>
          <p className="text-muted-foreground">Administra tu cartera de clientes</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar clientes..."
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {advisorClients
          .filter(
            (client) =>
              client.name.toLowerCase().includes(clientFilter.toLowerCase()) ||
              client.email.toLowerCase().includes(clientFilter.toLowerCase()),
          )
          .map((client) => (
            <Card key={client.id} className="border-border/40 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <img src={client.avatar || "/placeholder.svg"} alt={client.name} className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{client.name}</h3>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  </div>
                  <Badge className={getStatusColor(client.status)}>{client.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Plan</p>
                    <p className="font-medium">{client.plan}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Casos Activos</p>
                    <p className="font-medium">{client.activeCases}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Pagado</p>
                    <p className="font-medium">${client.totalPaid}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Último Contacto</p>
                    <p className="font-medium">{new Date(client.lastContact).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Mensaje
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}
