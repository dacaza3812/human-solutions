"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { EyeIcon, MessageSquareIcon, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"

interface Client {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  created_at: string
  // Add any other relevant client fields from your 'profiles' table
}

export function AdvisorClientsSection() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setLoading(true)
    // Fetch clients who have cases assigned to the current advisor, or all clients if advisor_id is null
    // This assumes a relationship or a way to link clients to an advisor's cases
    // For simplicity, let's fetch all clients with 'client' role for now.
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, phone, avatar_url, created_at")
      .eq("role", "client")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching clients:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes.",
        variant: "destructive",
      })
    } else {
      setClients(data as Client[])
    }
    setLoading(false)
  }

  const handleOpenModal = (client: Client) => {
    setSelectedClient(client)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedClient(null)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Clientes</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Cargando clientes...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <p className="text-center text-muted-foreground">No hay clientes para mostrar.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={client.avatar_url || "/placeholder-user.jpg"}
                          alt={client.first_name || "Client"}
                        />
                        <AvatarFallback>{client.first_name ? client.first_name[0] : "C"}</AvatarFallback>
                      </Avatar>
                      {client.first_name} {client.last_name}
                    </div>
                  </TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone || "N/A"}</TableCell>
                  <TableCell>{new Date(client.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleOpenModal(client)}>
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    <Button variant="ghost" size="sm" className="ml-2">
                      <MessageSquareIcon className="h-4 w-4" />
                      <span className="sr-only">Mensajes</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {selectedClient && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Detalles del Cliente</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={selectedClient.avatar_url || "/placeholder-user.jpg"}
                    alt={selectedClient.first_name || "Client"}
                  />
                  <AvatarFallback className="text-3xl">
                    {selectedClient.first_name ? selectedClient.first_name[0] : "C"}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold">
                  {selectedClient.first_name} {selectedClient.last_name}
                </h3>
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <Label className="text-right">Email:</Label>
                <span className="text-left">{selectedClient.email}</span>
              </div>
              {selectedClient.phone && (
                <div className="grid grid-cols-2 items-center gap-4">
                  <Label className="text-right">Teléfono:</Label>
                  <span className="text-left">{selectedClient.phone}</span>
                </div>
              )}
              <div className="grid grid-cols-2 items-center gap-4">
                <Label className="text-right">Registro:</Label>
                <span className="text-left">{new Date(selectedClient.created_at).toLocaleDateString()}</span>
              </div>
              {/* You can add more client-specific details here, e.g., total cases, active cases */}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseModal}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}
