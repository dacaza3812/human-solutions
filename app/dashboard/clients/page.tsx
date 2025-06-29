"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PlusCircle, XCircle, FileText } from "lucide-react"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  cases: number
}

export default function ClientsPage() {
  const { profile, loading } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(true)

  useEffect(() => {
    // Simulate fetching clients for advisor
    setLoadingClients(true)
    setTimeout(() => {
      setClients([
        {
          id: "cl1",
          name: "Ana García",
          email: "ana.garcia@example.com",
          phone: "555-1234",
          cases: 2,
        },
        {
          id: "cl2",
          name: "Luis Fernández",
          email: "luis.f@example.com",
          phone: "555-5678",
          cases: 1,
        },
        {
          id: "cl3",
          name: "Sofía Martínez",
          email: "sofia.m@example.com",
          phone: "555-9012",
          cases: 3,
        },
      ])
      setLoadingClients(false)
    }, 1000)
  }, [profile])

  if (loading || loadingClients) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Cargando...</h3>
        <p className="text-muted-foreground">Cargando tus clientes.</p>
      </div>
    )
  }

  if (profile?.account_type !== "advisor") {
    return (
      <div className="text-center py-12">
        <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-foreground mb-2">Acceso Denegado</h3>
        <p className="text-muted-foreground">Solo los usuarios con cuenta de asesor pueden acceder a esta sección.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Mis Clientes</h2>
          <p className="text-muted-foreground">Gestiona la información y los casos de tus clientes.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Aquí puedes ver todos los clientes que estás gestionando.</CardDescription>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <p className="text-muted-foreground">No hay clientes para mostrar.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Casos Activos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>{client.cases}</TableCell>
                    <TableCell className="text-right">
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
