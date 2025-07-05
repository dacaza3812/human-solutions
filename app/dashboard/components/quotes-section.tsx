"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EyeIcon, DollarSign, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"

interface Quote {
  id: string
  case_id: string
  amount: number
  currency: string
  status: "pending" | "accepted" | "rejected" | "paid"
  created_at: string
  cases: {
    title: string
    description: string
    case_type: string | null
  } | null
}

export function QuotesSection() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("quotes")
      .select("*, cases:case_id(title, description, case_type)")
      .eq("client_id", user.id) // Assuming quotes are linked to client_id
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching quotes:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las cotizaciones.",
        variant: "destructive",
      })
    } else {
      setQuotes(data as Quote[])
    }
    setLoading(false)
  }

  const handleOpenModal = (quote: Quote) => {
    setSelectedQuote(quote)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedQuote(null)
  }

  const getStatusBadgeClass = (status: Quote["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
      case "paid":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
      default:
        return ""
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Cotizaciones</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Cargando cotizaciones...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Cotizaciones</CardTitle>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <p className="text-center text-muted-foreground">No tienes cotizaciones para mostrar.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Caso</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.cases?.title || "N/A"}</TableCell>
                  <TableCell>
                    {quote.amount.toLocaleString(undefined, { style: "currency", currency: quote.currency || "USD" })}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(quote.status)}>{quote.status}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(quote.created_at), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleOpenModal(quote)}>
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    {quote.status === "accepted" && (
                      <Button variant="default" size="sm" className="ml-2">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Pagar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {selectedQuote && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalles de la Cotización</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Caso:</Label>
                <span className="col-span-3 font-medium">{selectedQuote.cases?.title || "N/A"}</span>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right">Descripción del Caso:</Label>
                <p className="col-span-3 text-sm text-muted-foreground">{selectedQuote.cases?.description || "N/A"}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Tipo de Caso:</Label>
                <span className="col-span-3">{selectedQuote.cases?.case_type || "N/A"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Monto:</Label>
                <span className="col-span-3 font-bold text-lg">
                  {selectedQuote.amount.toLocaleString(undefined, {
                    style: "currency",
                    currency: selectedQuote.currency || "USD",
                  })}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Estado:</Label>
                <span className="col-span-3">
                  <Badge className={getStatusBadgeClass(selectedQuote.status)}>{selectedQuote.status}</Badge>
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Fecha de Emisión:</Label>
                <span className="col-span-3">{format(new Date(selectedQuote.created_at), "dd/MM/yyyy HH:mm")}</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseModal}>
                Cerrar
              </Button>
              {selectedQuote.status === "pending" && (
                <>
                  <Button variant="default">Aceptar</Button>
                  <Button variant="destructive">Rechazar</Button>
                </>
              )}
              {selectedQuote.status === "accepted" && <Button variant="default">Proceder al Pago</Button>}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}
