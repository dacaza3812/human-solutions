"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, FileText, DollarSign, Calendar } from "lucide-react"
import { useState } from "react"

interface Quote {
  id: number
  title: string
  caseId: string
  amount: number
  status: "pending" | "accepted" | "rejected"
  dueDate: string
  description: string
}

export function QuotesSection() {
  const [newQuote, setNewQuote] = useState({
    title: "",
    caseId: "",
    amount: "",
    dueDate: "",
    description: "",
  })
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)

  const mockQuotes: Quote[] = [
    {
      id: 1,
      title: "Presupuesto Asesoría Legal",
      caseId: "CASE-001",
      amount: 500,
      status: "pending",
      dueDate: "2024-03-15",
      description: "Presupuesto para servicios de asesoría legal en caso de disputa contractual.",
    },
    {
      id: 2,
      title: "Presupuesto Mediación Familiar",
      caseId: "CASE-002",
      amount: 300,
      status: "accepted",
      dueDate: "2024-02-28",
      description: "Presupuesto para servicios de mediación en conflicto familiar.",
    },
    {
      id: 3,
      title: "Presupuesto Planificación Financiera",
      caseId: "CASE-003",
      amount: 750,
      status: "rejected",
      dueDate: "2024-03-01",
      description: "Presupuesto para un plan completo de planificación financiera personal.",
    },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setNewQuote((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (value: string, id: string) => {
    setNewQuote((prev) => ({ ...prev, [id]: value }))
  }

  const handleCreateQuote = () => {
    console.log("New Quote:", newQuote)
    // Here you would typically send this data to your backend
    // and then refresh the quotes list.
    setNewQuote({
      title: "",
      caseId: "",
      amount: "",
      dueDate: "",
      description: "",
    })
  }

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote)
  }

  const handleCloseQuoteView = () => {
    setSelectedQuote(null)
  }

  const handleAcceptQuote = (id: number) => {
    console.log(`Quote ${id} accepted`)
    // Update status in backend
  }

  const handleRejectQuote = (id: number) => {
    console.log(`Quote ${id} rejected`)
    // Update status in backend
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Mis Presupuestos</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Presupuesto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Presupuesto</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Título
                </Label>
                <Input id="title" value={newQuote.title} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="caseId" className="text-right">
                  ID de Caso
                </Label>
                <Input id="caseId" value={newQuote.caseId} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Monto
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={newQuote.amount}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right">
                  Fecha Límite
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newQuote.dueDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  value={newQuote.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={handleCreateQuote}>Crear Presupuesto</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockQuotes.map((quote) => (
          <Card key={quote.id} className="border-border/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">{quote.title}</CardTitle>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  quote.status === "pending"
                    ? "bg-orange-500/20 text-orange-400"
                    : quote.status === "accepted"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                }`}
              >
                {quote.status === "pending" && "Pendiente"}
                {quote.status === "accepted" && "Aceptado"}
                {quote.status === "rejected" && "Rechazado"}
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Caso ID: {quote.caseId}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>Monto: ${quote.amount} USD</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Fecha Límite: {quote.dueDate}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{quote.description}</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleViewQuote(quote)}>
                  Ver Detalles
                </Button>
                {quote.status === "pending" && (
                  <>
                    <Button onClick={() => handleAcceptQuote(quote.id)}>Aceptar</Button>
                    <Button variant="destructive" onClick={() => handleRejectQuote(quote.id)}>
                      Rechazar
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedQuote && (
        <Dialog open={!!selectedQuote} onOpenChange={handleCloseQuoteView}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedQuote.title}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p>
                <strong>Caso ID:</strong> {selectedQuote.caseId}
              </p>
              <p>
                <strong>Monto:</strong> ${selectedQuote.amount} USD
              </p>
              <p>
                <strong>Estado:</strong>{" "}
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    selectedQuote.status === "pending"
                      ? "bg-orange-500/20 text-orange-400"
                      : selectedQuote.status === "accepted"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {selectedQuote.status === "pending" && "Pendiente"}
                  {selectedQuote.status === "accepted" && "Aceptado"}
                  {selectedQuote.status === "rejected" && "Rechazado"}
                </span>
              </p>
              <p>
                <strong>Fecha Límite:</strong> {selectedQuote.dueDate}
              </p>
              <p>
                <strong>Descripción:</strong> {selectedQuote.description}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={handleCloseQuoteView}>Cerrar</Button>
              {selectedQuote.status === "pending" && (
                <>
                  <Button onClick={() => handleAcceptQuote(selectedQuote.id)}>Aceptar</Button>
                  <Button variant="destructive" onClick={() => handleRejectQuote(selectedQuote.id)}>
                    Rechazar
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
