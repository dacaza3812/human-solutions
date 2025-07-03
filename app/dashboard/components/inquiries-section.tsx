"use client"

import { AlertDescription } from "@/components/ui/alert"

import { Alert } from "@/components/ui/alert"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { Loader2, CheckCircle2, XCircle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Inquiry {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  service_area?: string
  priority?: "low" | "medium" | "high"
  message: string
  file_url?: string
  status: "new" | "in_progress" | "resolved" | "archived"
  created_at: string
}

export function InquiriesSection() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("new")
  const [searchTerm, setSearchTerm] = useState<string>("")

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

  const getPriorityBadgeVariant = (priority?: Inquiry["priority"]) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "warning"
      case "low":
        return "outline"
      default:
        return "outline"
    }
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
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
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
                  <TableHead>Área de Servicio</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Archivo</TableHead>
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
                    <TableCell>{inquiry.service_area || "General"}</TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(inquiry.priority)}>
                        {inquiry.priority
                          ? inquiry.priority.charAt(0).toUpperCase() + inquiry.priority.slice(1)
                          : "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{inquiry.message}</TableCell>
                    <TableCell>
                      {inquiry.file_url ? (
                        <a
                          href={inquiry.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-500 hover:underline"
                        >
                          Ver Archivo
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(inquiry.status)}>
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1).replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(inquiry.created_at), "dd MMM yyyy HH:mm", { locale: es })}</TableCell>
                    <TableCell className="text-right">
                      {inquiry.status === "new" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateInquiryStatus(inquiry.id, "in_progress")}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Marcar en Progreso
                        </Button>
                      )}
                      {inquiry.status === "in_progress" && (
                        <Button variant="outline" size="sm" onClick={() => updateInquiryStatus(inquiry.id, "resolved")}>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Marcar Resuelta
                        </Button>
                      )}
                      {(inquiry.status === "resolved" || inquiry.status === "in_progress") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateInquiryStatus(inquiry.id, "archived")}
                          className="ml-2 text-muted-foreground hover:text-foreground"
                        >
                          Archivar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
