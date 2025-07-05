"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye, Loader2, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getInquiries } from "@/actions/inquiries"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format as formatDatePicker } from "date-fns"

interface Inquiry {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  message: string
  file_url?: string
  created_at: string
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const inquiriesPerPage = 10

  useEffect(() => {
    const fetchInquiries = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, count, error } = await getInquiries(
          (currentPage - 1) * inquiriesPerPage,
          inquiriesPerPage,
          dateRange.from?.toISOString(),
          dateRange.to?.toISOString(),
        )
        if (error) {
          setError(error)
        } else {
          setInquiries(data || [])
          setTotalPages(Math.ceil((count || 0) / inquiriesPerPage))
        }
      } catch (err) {
        console.error("Failed to fetch inquiries:", err)
        setError("Error al cargar las consultas.")
      } finally {
        setLoading(false)
      }
    }

    fetchInquiries()
  }, [currentPage, inquiriesPerPage, dateRange])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleDateChange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range)
    setCurrentPage(1) // Reset to first page on date filter change
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="ml-2 text-muted-foreground">Cargando consultas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] text-red-500">
        <AlertCircle className="h-6 w-6 mr-2" />
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="grid gap-2">
            <CardTitle>Consultas de Clientes</CardTitle>
            <CardDescription>Gestiona las consultas enviadas por los clientes.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground",
                  )}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      `${formatDatePicker(dateRange.from, "LLL dd, y")} - ${formatDatePicker(
                        dateRange.to,
                        "LLL dd, y",
                      )}`
                    ) : (
                      formatDatePicker(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Filtrar por fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange as any}
                  onSelect={handleDateChange as any}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" onClick={() => handleDateChange({})}>
              Limpiar Filtro
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {inquiries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay consultas disponibles.</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Mensaje</TableHead>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-medium">{inquiry.id.substring(0, 8)}...</TableCell>
                      <TableCell>{`${inquiry.first_name} ${inquiry.last_name}`}</TableCell>
                      <TableCell>{inquiry.email}</TableCell>
                      <TableCell>{inquiry.phone || "N/A"}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{inquiry.message}</TableCell>
                      <TableCell>
                        {inquiry.file_url ? (
                          <a href={inquiry.file_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Ver Archivo
                            </Button>
                          </a>
                        ) : (
                          <Badge variant="secondary">No hay archivo</Badge>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(inquiry.created_at), "PPP p", { locale: es })}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver detalles</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={() => handlePageChange(currentPage - 1)}
                      isActive={currentPage > 1}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        href="#"
                        onClick={() => handlePageChange(index + 1)}
                        isActive={currentPage === index + 1}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={() => handlePageChange(currentPage + 1)}
                      isActive={currentPage < totalPages}
                    />
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
