"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Filter, MessageSquare, CheckCircle, XCircle } from "lucide-react"
import { getInquiries, createInquiry, handleStatusChange } from "@/actions/inquiries"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface Inquiry {
  id: string
  user_id: string
  title: string
  description: string | null
  status: "pending" | "in_progress" | "resolved" | "closed"
  created_at: string
}

export default function InquiriesPage() {
  const { user, profile } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [newInquiry, setNewInquiry] = useState({
    title: "",
    description: "",
  })
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchInquiriesData()
  }, [])

  const fetchInquiriesData = async () => {
    setLoading(true)
    const { data, success, message } = await getInquiries()
    if (success) {
      setInquiries(data as Inquiry[])
    } else {
      toast({
        title: "Error",
        description: message || "Failed to fetch inquiries.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setNewInquiry((prev) => ({ ...prev, [id]: value }))
  }

  const handleCreateInquiry = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    const formData = new FormData()
    formData.append("title", newInquiry.title)
    formData.append("description", newInquiry.description)
    formData.append("userId", user.id)

    const { success, message } = await createInquiry(formData)
    if (success) {
      toast({
        title: "Éxito",
        description: "Consulta creada exitosamente.",
      })
      setNewInquiry({ title: "", description: "" })
      fetchInquiriesData() // Refresh the list
    } else {
      toast({
        title: "Error",
        description: message || "Failed to create inquiry.",
        variant: "destructive",
      })
    }
    setIsCreating(false)
  }

  const handleViewInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
  }

  const handleCloseInquiryView = () => {
    setSelectedInquiry(null)
  }

  const handleChangeStatus = async (inquiryId: string, newStatus: string) => {
    const { success, error } = await handleStatusChange(inquiryId, newStatus)
    if (success) {
      toast({
        title: "Éxito",
        description: `Estado de la consulta actualizado a ${newStatus}.`,
      })
      fetchInquiriesData() // Refresh the list
      setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus as Inquiry["status"] } : null))
    } else {
      toast({
        title: "Error",
        description: error || "Failed to update inquiry status.",
        variant: "destructive",
      })
    }
  }

  const filteredInquiries = inquiries.filter(
    (inquiry) =>
      (inquiry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === "all" || inquiry.status === filterStatus),
  )

  const getStatusBadgeColor = (status: Inquiry["status"]) => {
    switch (status) {
      case "pending":
        return "bg-orange-500/20 text-orange-400"
      case "in_progress":
        return "bg-blue-500/20 text-blue-400"
      case "resolved":
        return "bg-emerald-500/20 text-emerald-400"
      case "closed":
        return "bg-gray-500/20 text-gray-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Mis Consultas</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Consulta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Consulta</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Título
                </Label>
                <Input id="title" value={newInquiry.title} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  value={newInquiry.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={handleCreateInquiry} disabled={isCreating}>
              {isCreating ? "Creando..." : "Crear Consulta"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar consultas..."
            className="w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="in_progress">En Progreso</SelectItem>
            <SelectItem value="resolved">Resuelta</SelectItem>
            <SelectItem value="closed">Cerrada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="border-border/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredInquiries.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No se encontraron consultas.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInquiries.map((inquiry) => (
            <Card key={inquiry.id} className="border-border/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">{inquiry.title}</CardTitle>
                <Badge className={`px-2 py-1 text-xs ${getStatusBadgeColor(inquiry.status)}`}>
                  {inquiry.status.replace(/_/g, " ")}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{inquiry.description}</p>
                <p className="text-xs text-muted-foreground">
                  Creado: {new Date(inquiry.created_at).toLocaleDateString()}
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => handleViewInquiry(inquiry)}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Ver Detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedInquiry && (
        <Dialog open={!!selectedInquiry} onOpenChange={handleCloseInquiryView}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedInquiry.title}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p>
                <strong>Descripción:</strong> {selectedInquiry.description}
              </p>
              <p>
                <strong>Estado:</strong>{" "}
                <Badge className={getStatusBadgeColor(selectedInquiry.status)}>
                  {selectedInquiry.status.replace(/_/g, " ")}
                </Badge>
              </p>
              <p>
                <strong>Fecha de Creación:</strong> {new Date(selectedInquiry.created_at).toLocaleDateString()}
              </p>
            </div>
            {profile?.account_type === "advisor" && selectedInquiry.status !== "closed" && (
              <div className="flex justify-end gap-2">
                {selectedInquiry.status === "pending" && (
                  <Button onClick={() => handleChangeStatus(selectedInquiry.id, "in_progress")}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar en Progreso
                  </Button>
                )}
                {selectedInquiry.status === "in_progress" && (
                  <Button onClick={() => handleChangeStatus(selectedInquiry.id, "resolved")}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar Resuelta
                  </Button>
                )}
                {(selectedInquiry.status === "in_progress" || selectedInquiry.status === "resolved") && (
                  <Button variant="destructive" onClick={() => handleChangeStatus(selectedInquiry.id, "closed")}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Cerrar Consulta
                  </Button>
                )}
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={handleCloseInquiryView}>Cerrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
