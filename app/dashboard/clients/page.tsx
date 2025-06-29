"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  status: string
  last_contact: string
}

export default function ClientsPage() {
  const { profile, loading: authLoading } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    if (!authLoading && profile?.account_type === "advisor") {
      fetchClients()
    } else if (!authLoading && profile?.account_type !== "advisor") {
      setLoading(false) // Not an advisor, so no clients to load
    }
  }, [profile, authLoading])

  const fetchClients = async () => {
    setLoading(true)
    setError(null)
    try {
      // Simulate fetching data for advisor's clients
      setClients([
        {
          id: "101",
          name: "Juan Pérez",
          email: "juan@example.com",
          phone: "555-1234",
          status: "Activo",
          last_contact: "2024-05-28",
        },
        {
          id: "102",
          name: "Ana López",
          email: "ana@example.com",
          phone: "555-5678",
          status: "Pendiente",
          last_contact: "2024-05-25",
        },
        {
          id: "103",
          name: "Carlos García",
          email: "carlos@example.com",
          phone: "555-9012",
          status: "Activo",
          last_contact: "2024-05-29",
        },
        {
          id: "104",
          name: "María Rodríguez",
          email: "maria@example.com",
          phone: "555-3456",
          status: "Inactivo",
          last_contact: "2024-05-10",
        },
      ])
    } catch (err) {
      console.error("Failed to fetch clients:", err)
      setError("Failed to load clients. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || client.status.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  if (profile?.account_type !== "advisor") {
    return (
      <div className="text-center py-12">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-foreground mb-2">Acceso Denegado</h3>
        <p className="text-muted-foreground">Esta sección es solo para asesores.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredClients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron clientes que coincidan con tu búsqueda o filtros.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Contacto</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          client.status === "Activo"
                            ? "bg-green-100 text-green-800"
                            : client.status === "Pendiente"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {client.status}
                      </span>
                    </TableCell>
                    <TableCell>{client.last_contact}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Ver Perfil
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
