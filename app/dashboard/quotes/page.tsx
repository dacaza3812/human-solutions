"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle, XCircle, FileText } from "lucide-react"

interface Quote {
  id: string
  service: string
  status: string
  amount: string
  date: string
}

export default function QuotesPage() {
  const { profile, loading } = useAuth()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loadingQuotes, setLoadingQuotes] = useState(true)

  useEffect(() => {
    // Simulate fetching quotes for client
    setLoadingQuotes(true)
    setTimeout(() => {
      setQuotes([
        {
          id: "q1",
          service: "Asesoría Legal Inicial",
          status: "Pendiente",
          amount: "$150",
          date: "2023-10-25",
        },
        {
          id: "q2",
          service: "Representación en Juicio",
          status: "Aceptada",
          amount: "$1200",
          date: "2023-10-20",
        },
        {
          id: "q3",
          service: "Redacción de Contrato",
          status: "Rechazada",
          amount: "$300",
          date: "2023-10-18",
        },
        {
          id: "q4",
          service: "Consulta de Propiedad",
          status: "Completada",
          amount: "$200",
          date: "2023-10-10",
        },
      ])
      setLoadingQuotes(false)
    }, 1000)
  }, [profile])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Pendiente":
        return "secondary"
      case "Aceptada":
        return "default"
      case "Rechazada":
        return "destructive"
      case "Completada":
        return "success" // Assuming you have a 'success' variant for Badge
      default:
        return "outline"
    }
  }

  if (loading || loadingQuotes) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Cargando...</h3>
        <p className="text-muted-foreground">Cargando tus citas y cotizaciones.</p>
      </div>
    )
  }

  if (profile?.account_type !== "client") {
    return (
      <div className="text-center py-12">
        <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-foreground mb-2">Acceso Denegado</h3>
        <p className="text-muted-foreground">Solo los usuarios con cuenta de cliente pueden acceder a esta sección.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Mis Citas y Cotizaciones</h2>
          <p className="text-muted-foreground">Revisa el estado de tus solicitudes de servicio y citas.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Solicitar Nueva Cita/Cotización
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Solicitudes</CardTitle>
          <CardDescription>Aquí puedes ver todas tus solicitudes de citas y cotizaciones.</CardDescription>
        </CardHeader>
        <CardContent>
          {quotes.length === 0 ? (
            <p className="text-muted-foreground">No hay solicitudes para mostrar.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Solicitud</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.service}</TableCell>
                    <TableCell>{quote.amount}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(quote.status)}>{quote.status}</Badge>
                    </TableCell>
                    <TableCell>{quote.date}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        Ver Detalles
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
