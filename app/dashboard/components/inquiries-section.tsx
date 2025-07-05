"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
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

export default function InquiriesSection() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [newStatus, setNewStatus] = useState<string>("")
  const { toast } = useToast()

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Consultas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Cargando consultas...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Consultas Recientes</CardTitle>
        <Link href="/dashboard/inquiries">
          <Button variant="link" size="sm" className="text-emerald-500">
            Ver todas <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {inquiries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay consultas nuevas.</p>
        ) : (
          <ul className="space-y-3">
            {inquiries.slice(0, 3).map((inquiry) => (
              <li key={inquiry.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {inquiry.first_name} {inquiry.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{inquiry.email}</p>
                </div>
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
                              className="col-span-3 text-blue-500 hover:underline"
                            >
                              Ver archivo adjunto
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
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
