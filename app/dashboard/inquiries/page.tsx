"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { format } from "date-fns"
import { EyeIcon, DownloadIcon, XIcon, CheckCircleIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"

interface Inquiry {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  message: string
  file_url: string | null
  status: "new" | "in_progress" | "resolved" | "archived"
  created_at: string
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<Inquiry["status"] | "">("")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false })
    if (error) {
      console.error("Error fetching inquiries:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes.",
        variant: "destructive",
      })
    } else {
      setInquiries(data as Inquiry[])
    }
    setLoading(false)
  }

  const handleOpenModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    setCurrentStatus(inquiry.status)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedInquiry(null)
    setCurrentStatus("")
  }

  const handleStatusChange = async (newStatus: Inquiry["status"]) => {
    if (!selectedInquiry) return

    setIsUpdatingStatus(true)
    const { error } = await supabase.from("inquiries").update({ status: newStatus }).eq("id", selectedInquiry.id)

    if (error) {
      console.error("Error updating inquiry status:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del mensaje.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Éxito",
        description: "Estado del mensaje actualizado correctamente.",
        action: <CheckCircleIcon className="text-green-500" />,
      })
      setCurrentStatus(newStatus)
      // Optimistically update the list or refetch
      setInquiries((prev) => prev.map((inq) => (inq.id === selectedInquiry.id ? { ...inq, status: newStatus } : inq)))
      setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null))
    }
    setIsUpdatingStatus(false)
  }

  const getStatusBadgeClass = (status: Inquiry["status"]) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
      default:
        return ""
    }
  }

  const isImageFile = (url: string) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]
    const extension = url.split(".").pop()?.toLowerCase()
    return extension && imageExtensions.includes(`.${extension}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando mensajes...</span>
      </div>
    )
  }

  return (
    <div className="grid gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Mensajes de Contacto</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Todos los Mensajes</CardTitle>
        </CardHeader>
        <CardContent>
          {inquiries.length === 0 ? (
            <p className="text-center text-muted-foreground">No hay mensajes de contacto para mostrar.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
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
                    <TableCell>{format(new Date(inquiry.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full ${getStatusBadgeClass(inquiry.status)}`}>
                        {inquiry.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" onClick={() => handleOpenModal(inquiry)}>
                        <EyeIcon className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {selectedInquiry && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Abrir Modal</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Mensaje de Contacto</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div>
                <strong>Nombre:</strong> {selectedInquiry.first_name} {selectedInquiry.last_name}
              </div>
              <div>
                <strong>Email:</strong> {selectedInquiry.email}
              </div>
              <div>
                <strong>Fecha:</strong> {format(new Date(selectedInquiry.created_at), "dd/MM/yyyy HH:mm")}
              </div>
              <div>
                <strong>Estado:</strong>
                <Select value={currentStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Nuevo</SelectItem>
                    <SelectItem value="in_progress">En Progreso</SelectItem>
                    <SelectItem value="resolved">Resuelto</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <strong>Mensaje:</strong> {selectedInquiry.message}
              </div>
              {selectedInquiry.file_url && (
                <div>
                  <strong>Archivo Adjunto:</strong>
                  {isImageFile(selectedInquiry.file_url) ? (
                    <Image
                      src={selectedInquiry.file_url || "/placeholder.svg"}
                      alt="Archivo Adjunto"
                      width={200}
                      height={200}
                    />
                  ) : (
                    <a href={selectedInquiry.file_url} download>
                      <Button variant="outline">
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    </a>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseModal}>
                <XIcon className="h-4 w-4 mr-2" />
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
