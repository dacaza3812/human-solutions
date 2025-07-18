"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { EyeIcon, DownloadIcon, FileText, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("inquiries")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          throw new Error(error.message)
        }

        setInquiries(data || [])
      } catch (err: any) {
        console.error("Error fetching inquiries:", err)
        setError(err.message || "Error al cargar las consultas.")
      } finally {
        setLoading(false)
      }
    }

    fetchInquiries()
  }, [])

  if (loading) {
    return (
      <div className="p-4">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Consultas de Contacto</CardTitle>
        </CardHeader>
        <CardContent>
          {inquiries.length === 0 ? (
            <p className="text-muted-foreground">No hay consultas de contacto.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell>
                      {inquiry.first_name} {inquiry.last_name}
                    </TableCell>
                    <TableCell>{inquiry.email}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{inquiry.message}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={inquiry.status}
                        onValueChange={(newStatus) => console.log(`Change status to ${newStatus}`)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Cambiar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Nuevo</SelectItem>
                          <SelectItem value="in_progress">En Progreso</SelectItem>
                          <SelectItem value="resolved">Resuelto</SelectItem>
                          <SelectItem value="archived">Archivado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{new Date(inquiry.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <EyeIcon className="h-4 w-4" />
                            <span className="sr-only">Ver detalles</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Detalles de la Consulta</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label className="text-right">Nombre:</Label>
                              <span className="col-span-3">
                                {inquiry.first_name} {inquiry.last_name}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label className="text-right">Email:</Label>
                              <span className="col-span-3">{inquiry.email}</span>
                            </div>
                            {inquiry.phone && (
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Teléfono:</Label>
                                <span className="col-span-3">{inquiry.phone}</span>
                              </div>
                            )}
                            <div className="grid grid-cols-4 items-start gap-4">
                              <Label className="text-right">Mensaje:</Label>
                              <p className="col-span-3 text-sm text-muted-foreground">{inquiry.message}</p>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label className="text-right">Estado:</Label>
                              <Select
                                defaultValue={inquiry.status}
                                onValueChange={(newStatus) => console.log(`Change status to ${newStatus}`)}
                              >
                                <SelectTrigger className="w-[180px] col-span-3">
                                  <SelectValue placeholder="Cambiar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">Nuevo</SelectItem>
                                  <SelectItem value="in_progress">En Progreso</SelectItem>
                                  <SelectItem value="resolved">Resuelto</SelectItem>
                                  <SelectItem value="archived">Archivado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {inquiry.file_url && (
                              <div className="grid grid-cols-4 items-start gap-4">
                                <Label className="text-right">Archivo:</Label>
                                <div className="col-span-3 flex flex-col gap-2">
                                  {inquiry.file_url.match(/\.(jpeg|jpg|gif|png|svg)$/i) ? (
                                    <Image
                                      src={inquiry.file_url || "/placeholder.svg"}
                                      alt="Archivo adjunto"
                                      width={200}
                                      height={200}
                                      className="max-w-full h-auto object-contain rounded-md border"
                                    />
                                  ) : (
                                    <div className="flex items-center text-muted-foreground">
                                      <FileText className="h-5 w-5 mr-2" />
                                      <span>Archivo adjunto</span>
                                    </div>
                                  )}
                                  <a
                                    href={inquiry.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-emerald-500 hover:underline"
                                  >
                                    <DownloadIcon className="h-4 w-4 mr-1" />
                                    Descargar archivo
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
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