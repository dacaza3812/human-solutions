"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { MessageCircle, Plus, Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface AdvisorClient {
  id: number
  name: string
  email: string
  phone: string
  avatar: string
  totalCases: number
  activeCases: number
  completedCases: number
  joinDate: string
  lastActivity: string
}

interface AdvisorCase {
  id: number
  clientName: string
  clientId: number
  title: string
  type: string
  status: string
  priority: string
  createdDate: string
  dueDate: string
  description: string
  progress: number
}

interface AdvisorCasesSectionProps {
  advisorCases: AdvisorCase[]
  caseFilter: string
  setCaseFilter: (filter: string) => void
  setSelectedCase: (caseItem: AdvisorCase | null) => void
  openChatForCase: (caseId: number) => void
  selectedCase: AdvisorCase | null
  setSelectedClient: (client: AdvisorClient | null) => void // Added for consistency, though not directly used here
}

export function AdvisorCasesSection({
  advisorCases,
  caseFilter,
  setCaseFilter,
  setSelectedCase,
  openChatForCase,
  selectedCase,
}: AdvisorCasesSectionProps) {
  const [isCaseDetailsOpen, setIsCaseDetailsOpen] = useState(false)

  const handleViewDetails = (caseItem: AdvisorCase) => {
    setSelectedCase(caseItem)
    setIsCaseDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setSelectedCase(null)
    setIsCaseDetailsOpen(false)
  }

  const filteredCases = advisorCases.filter((case_item) => {
    if (caseFilter === "all") return true
    return case_item.status.toLowerCase().includes(caseFilter.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Mis Casos</h2>
          <p className="text-muted-foreground">Gestiona todos los casos de tus clientes.</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Caso
        </Button>
      </div>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Lista de Casos</CardTitle>
          <div className="flex items-center space-x-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar caso..." className="pl-10" />
            </div>
            <Select onValueChange={setCaseFilter} value={caseFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="en progreso">En Progreso</SelectItem>
                <SelectItem value="programada">Programada</SelectItem>
                <SelectItem value="en revisión">En Revisión</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Título</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Prioridad</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Progreso</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((case_item) => (
                  <tr key={case_item.id} className="border-b border-border/20 hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm font-medium">{case_item.clientName}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{case_item.title}</td>
                    <td className="py-3 px-4 text-sm">{case_item.type}</td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          case_item.status === "En Progreso"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            : case_item.status === "Programada"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                              : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        }`}
                      >
                        {case_item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{case_item.priority}</td>
                    <td className="py-3 px-4 text-sm">
                      <Progress value={case_item.progress} className="w-24" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(case_item)}>
                        Ver Detalles
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openChatForCase(case_item.id)}>
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Case Details Dialog */}
      <Dialog open={isCaseDetailsOpen} onOpenChange={setIsCaseDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedCase?.title}</DialogTitle>
            <DialogDescription>Detalles del caso para {selectedCase?.clientName}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientName" className="text-right">
                Cliente
              </Label>
              <Input id="clientName" value={selectedCase?.clientName} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Tipo
              </Label>
              <Input id="type" value={selectedCase?.type} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Estado
              </Label>
              <Input id="status" value={selectedCase?.status} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Prioridad
              </Label>
              <Input id="priority" value={selectedCase?.priority} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="createdDate" className="text-right">
                Fecha Creación
              </Label>
              <Input id="createdDate" value={selectedCase?.createdDate} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Fecha Vencimiento
              </Label>
              <Input id="dueDate" value={selectedCase?.dueDate} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right">
                Descripción
              </Label>
              <Textarea id="description" value={selectedCase?.description} readOnly className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="progress" className="text-right">
                Progreso
              </Label>
              <Progress value={selectedCase?.progress} className="col-span-3" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleCloseDetails}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
