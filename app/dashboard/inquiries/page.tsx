"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { getInquiries, updateInquiryStatus } from "@/actions/inquiries"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination"
import { File } from "lucide-react"

interface Inquiry {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  message: string
  file_url?: string
  status: "pending" | "reviewed" | "closed"
  created_at: string
}

const ITEMS_PER_PAGE = 10

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [newStatus, setNewStatus] = useState<string>("")
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    setLoading(true)
    const data = await getInquiries()
    setInquiries(data as Inquiry[])
    setLoading(false)
  }

  const handleStatusChange = async () => {
    if (selectedInquiry && newStatus) {
      const result = await updateInquiryStatus(selectedInquiry.id, newStatus)
      if (result.success) {
        toast({ title: "Éxito", description: result.message })
        fetchInquiries() // Re-fetch inquiries to update the list
        setSelectedInquiry(null) // Close dialog
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" })
      }
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "reviewed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "closed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(inquiries.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentInquiries = inquiries.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="text-2xl font-bold mb-6">Gestión de Consultas</h1>
        <p className="text-muted-foreground">Cargando consultas...</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Consultas</h1>

      <Card>
        <CardHeader>
          <CardTitle>Todas las Consultas</CardTitle>
        </CardHeader>
        <CardContent>
          {inquiries.length === 0 ? (
            <p className="text-center text-muted-foreground">No hay consultas registradas.</p>
          ) : (
            <>
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
                  {currentInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell>
                        {inquiry.first_name} {inquiry.last_name}
                      </TableCell>
                      <TableCell>{inquiry.email}</TableCell>
                      <TableCell>{format(new Date(inquiry.created_at), "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(inquiry.status)}`}
                        >
                          {inquiry.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog
                          onOpenChange={(open) => {
                            if (!open) setSelectedInquiry(null)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInquiry(inquiry)
                                setNewStatus(inquiry.status)
                              }}
                            >
                              Ver Detalles
                            </Button>
                          </DialogTrigger>
                          {selectedInquiry && (
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Detalles de la Consulta</DialogTitle>
                                <DialogDescription>
                                  Información completa de la consulta de {selectedInquiry.first_name}.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="name" className="text-right">
                                    Nombre:
                                  </Label>
                                  <span className="col-span-3">
                                    {selectedInquiry.first_name} {selectedInquiry.last_name}
                                  </span>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="email" className="text-right">
                                    Email:
                                  </Label>
                                  <span className="col-span-3">{selectedInquiry.email}</span>
                                </div>
                                {selectedInquiry.phone && (
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="phone" className="text-right">
                                      Teléfono:
                                    </Label>
                                    <span className="col-span-3">{selectedInquiry.phone}</span>
                                  </div>
                                )}
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="message" className="text-right">
                                    Mensaje:
                                  </Label>
                                  <Textarea
                                    id="message"
                                    value={selectedInquiry.message}
                                    readOnly
                                    className="col-span-3 h-24 resize-none"
                                  />
                                </div>
                                {selectedInquiry.file_url && (
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="file" className="text-right">
                                      Archivo:
                                    </Label>
                                    <a
                                      href={selectedInquiry.file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="col-span-3 text-blue-500 hover:underline flex items-center"
                                    >
                                      <File className="w-4 h-4 mr-2" /> Ver archivo adjunto
                                    </a>
                                  </div>
                                )}
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="status" className="text-right">
                                    Estado:
                                  </Label>
                                  <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue placeholder="Seleccionar estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pendiente</SelectItem>
                                      <SelectItem value="reviewed">Revisado</SelectItem>
                                      <SelectItem value="closed">Cerrado</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={handleStatusChange}>Actualizar Estado</Button>
                              </DialogFooter>
                            </DialogContent>
                          )}
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" onClick={() => handlePageChange(Math.max(1, currentPage - 1))} />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink href="#" isActive={currentPage === i + 1} onClick={() => handlePageChange(i + 1)}>
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext href="#" onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
