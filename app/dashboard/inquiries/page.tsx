"use client"

import { Label } from "@/components/ui/label"

import { AlertDescription } from "@/components/ui/alert"

import { Alert } from "@/components/ui/alert"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { Loader2, XCircle, Search, Eye, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Image from "next/image"

interface Inquiry {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  message: string
  file_url?: string
  status: "new" | "in_progress" | "resolved" | "archived"
  created_at: string
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("new")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchInquiries()
  }, [filterStatus, searchTerm])

  const fetchInquiries = async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase.from("inquiries").select("*")

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus)
      }

      if (searchTerm) {
        query = query.or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,message.ilike.%${searchTerm}%`,
        )
      }

      query = query.order("created_at", { ascending: false })

      const { data, error } = await query

      if (error) {
        throw error
      }
      setInquiries(data || [])
    } catch (err: any) {
      console.error("Error fetching inquiries:", err)
      setError("Error al cargar las consultas: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateInquiryStatus = async (id: string, newStatus: Inquiry["status"]) => {
    try {
      const { error } = await supabase
        .from("inquiries")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) {
        throw error
      }
      fetchInquiries() // Re-fetch to update the list
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null))
      }
    } catch (err: any) {
      console.error("Error updating inquiry status:", err)
      setError("Error al actualizar el estado de la consulta: " + err.message)
    }
  }

  const getStatusBadgeVariant = (status: Inquiry["status"]) => {
    switch (status) {
      case "new":
        return "default"
      case "in_progress":
        return "secondary"
      case "resolved":
        return "success"
      case "archived":
        return "outline"
      default:
        return "default"
    }
  }

  const openInquiryModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    setIsModalOpen(true)
  }

  const closeInquiryModal = () => {
    setIsModalOpen(false)
    setSelectedInquiry(null)
  }

  const isImageFile = (url: string) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]
    const extension = url.substring(url.lastIndexOf(".")).toLowerCase()
    return imageExtensions.includes(extension)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="ml-2 text-muted-foreground">Cargando consultas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Consultas de Contacto</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar consultas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-[200px]"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="new">Nuevas</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="resolved">Resueltas</SelectItem>
                <SelectItem value="archived">Archivadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {inquiries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No hay consultas para mostrar.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Mensaje</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-medium">
                        {inquiry.first_name} {inquiry.last_name}
                      </TableCell>
                      <TableCell>{inquiry.email}</TableCell>
                      <TableCell>{inquiry.phone || "N/A"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{inquiry.message}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(inquiry.status)}>
                          {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1).replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(inquiry.created_at), "dd MMM yyyy HH:mm", { locale: es })}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openInquiryModal(inquiry)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedInquiry && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalles de la Consulta</DialogTitle>
              <DialogDescription>
                Información completa sobre la consulta de {selectedInquiry.first_name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Nombre:</Label>
                <span className="col-span-3">
                  {selectedInquiry.first_name} {selectedInquiry.last_name}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Email:</Label>
                <span className="col-span-3">{selectedInquiry.email}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Teléfono:</Label>
                <span className="col-span-3">{selectedInquiry.phone || "N/A"}</span>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right">Mensaje:</Label>
                <p className="col-span-3 whitespace-pre-wrap">{selectedInquiry.message}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Fecha:</Label>
                <span className="col-span-3">
                  {format(new Date(selectedInquiry.created_at), "dd MMM yyyy HH:mm", { locale: es })}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Estado:</Label>
                <Select
                  value={selectedInquiry.status}
                  onValueChange={(newStatus) => updateInquiryStatus(selectedInquiry.id, newStatus as Inquiry["status"])}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Nueva</SelectItem>
                    <SelectItem value="in_progress">En Progreso</SelectItem>
                    <SelectItem value="resolved">Resuelta</SelectItem>
                    <SelectItem value="archived">Archivada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedInquiry.file_url && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right">Archivo:</Label>
                  <div className="col-span-3 flex flex-col space-y-2">
                    {isImageFile(selectedInquiry.file_url) ? (
                      <Image
                        src={selectedInquiry.file_url || "/placeholder.svg"}
                        alt="Archivo adjunto"
                        width={200}
                        height={200}
                        className="max-w-full h-auto rounded-md border"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <File className="h-5 w-5" />
                        <span>{selectedInquiry.file_url.split("/").pop()}</span>
                      </div>
                    )}
                    <a
                      href={selectedInquiry.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-500 hover:underline flex items-center"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar Archivo
                    </a>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={closeInquiryModal}>Cerrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
