"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MessageSquare, Eye, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClient, setSelectedClient] = useState<AdvisorClient | null>(null)
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    accountType: "client", // Default to client
  })

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
    {
      id: 4,
      name: "Laura García",
      email: "laura@email.com",
      phone: "+52 999 888 7777",
      avatar: "/placeholder-user.jpg",
      totalCases: 1,
      activeCases: 0,
      completedCases: 1,
      joinDate: "2024-01-20",
      lastActivity: "2024-01-20",
    },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setNewClient((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (value: string, id: string) => {
    setNewClient((prev) => ({ ...prev, [id]: value }))
  }

  const handleAddClient = () => {
    console.log("New Client:", newClient)
    // Here you would typically send this data to your backend
    // and then refresh the clients list.
    setNewClient({ name: "", email: "", phone: "", accountType: "client" })
  }

  const handleViewClient = (client: AdvisorClient) => {
    setSelectedClient(client)
  }

  const handleCloseClientView = () => {
    setSelectedClient(null)
  }

  const filteredClients = advisorClients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Mis Clientes</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input id="name" value={newClient.name} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Teléfono
                </Label>
                <Input id="phone" value={newClient.phone} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="accountType" className="text-right">
                  Tipo de Cuenta
                </Label>
                <Select
                  value={newClient.accountType}
                  onValueChange={(value) => handleSelectChange(value, "accountType")}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Cliente</SelectItem>
                    <SelectItem value="advisor">Asesor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleAddClient}>Agregar Cliente</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes por nombre o email..."
          className="w-full pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="border-border/40">
            <CardContent className="flex flex-col items-center p-6">
              <Avatar className="w-20 h-20 mb-4">
                <AvatarImage src={client.avatar || "/placeholder.svg"} />
                <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold text-foreground">{client.name}</h3>
              <p className="text-sm text-muted-foreground">{client.email}</p>
              <p className="text-sm text-muted-foreground">{client.phone}</p>
              <div className="grid grid-cols-3 gap-4 mt-4 w-full text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">{client.totalCases}</p>
                  <p className="text-xs text-muted-foreground">Casos Totales</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{client.activeCases}</p>
                  <p className="text-xs text-muted-foreground">Activos</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{client.completedCases}</p>
                  <p className="text-xs text-muted-foreground">Completados</p>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => handleViewClient(client)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalles
                </Button>
                <Button>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Mensaje
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedClient && (
        <Dialog open={!!selectedClient} onOpenChange={handleCloseClientView}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Detalles del Cliente</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={selectedClient.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{selectedClient.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="text-2xl font-bold text-foreground">{selectedClient.name}</h3>
                <p className="text-md text-muted-foreground">{selectedClient.email}</p>
                <p className="text-md text-muted-foreground">{selectedClient.phone}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Casos Totales:</p>
                  <p>{selectedClient.totalCases}</p>
                </div>
                <div>
                  <p className="font-medium">Casos Activos:</p>
                  <p>{selectedClient.activeCases}</p>
                </div>
                <div>
                  <p className="font-medium">Casos Completados:</p>
                  <p>{selectedClient.completedCases}</p>
                </div>
                <div>
                  <p className="font-medium">Fecha de Ingreso:</p>
                  <p>{selectedClient.joinDate}</p>
                </div>
                <div>
                  <p className="font-medium">Última Actividad:</p>
                  <p>{selectedClient.lastActivity}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCloseClientView}>Cerrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
