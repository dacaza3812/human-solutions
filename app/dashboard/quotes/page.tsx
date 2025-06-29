"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PlusCircle, XCircle } from "lucide-react"

interface Quote {
  id: string
  type: string
  date: string
  status: string
  advisor: string
}

export default function QuotesPage() {
  const { profile, loading: authLoading } = useAuth()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && profile) {
      fetchQuotes()
    }
  }, [profile, authLoading])

  const fetchQuotes = async () => {
    setLoading(true)
    setError(null)
    try {
      // Simulate fetching data for client's quotes/appointments
      setQuotes([
        { id: "1", type: "Consulta Inicial", date: "2024-06-10", status: "Confirmada", advisor: "Dr. Smith" },
        { id: "2", type: "Revisión de Documentos", date: "2024-06-15", status: "Pendiente", advisor: "Dra. García" },
        { id: "3", type: "Cotización de Servicio", date: "2024-06-05", status: "Completada", advisor: "Dr. Smith" },
      ])
    } catch (err) {
      console.error("Failed to fetch quotes:", err)
      setError("Failed to load quotes. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  if (profile?.account_type !== "client") {
    return (
      <div className="text-center py-12">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-foreground mb-2">Acceso Denegado</h3>
        <p className="text-muted-foreground">Esta sección es solo para clientes.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mis Citas y Cotizaciones</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Solicitar Nueva Cita/Cotización
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximas Citas y Cotizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {quotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No tienes citas o cotizaciones pendientes.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Asesor</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.type}</TableCell>
                    <TableCell>{quote.date}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          quote.status === "Confirmada"
                            ? "bg-green-100 text-green-800"
                            : quote.status === "Pendiente"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {quote.status}
                      </span>
                    </TableCell>
                    <TableCell>{quote.advisor}</TableCell>
                    <TableCell>
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
