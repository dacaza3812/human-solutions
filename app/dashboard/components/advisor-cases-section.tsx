"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Filter, ChevronDown, MessageSquare, Edit, Trash2, Calendar, Users } from "lucide-react"
import { Progress } from "@/components/ui/progress"

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

export function AdvisorCasesSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [newCase, setNewCase] = useState({
    title: "",
    description: "",
    type: "",
    priority: "",
    client: "",
    dueDate: "",
  })
  const [selectedCase, setSelectedCase] = useState<AdvisorCase | null>(null)

  // Mock data for advisor's cases
  const advisorCases: AdvisorCase[] = [
    {
      id: 1,
      clientName: "Juan Pérez",
      clientId: 101,
      title: "Asesoría Financiera Personal",
      type: "Asesoría Financiera",
      status: "En Progreso",
      priority: "Alta",
      createdDate: "2024-01-15",
      dueDate: "2024-02-15",
      description:
        "Planificación presupuestaria y estrategias de ahorro para mejorar la situación financiera familiar.",
      progress: 65,
    },
    {
      id: 2,
      clientName: "María López",
      clientId: 102,
      title: "Mediación Familiar",
      type: "Relaciones Familiares",
      status: "Programada",
      priority: "Media",
      createdDate: "2024-01-10",
      dueDate: "2024-01-30",
      description: "Resolución de conflictos familiares y mejora de la comunicación.",
      progress: 25,
    },
    {
      id: 3,
      clientName: "Carlos Mendoza",
      clientId: 103,
      title: "Consulta Legal",
      type: "Asesoría Legal",
      status: "En Revisión",
      priority: "Baja",
      createdDate: "2024-01-08",
      dueDate: "2024-01-25",
      description: "Consulta sobre derechos laborales y procedimientos legales.",
      progress: 80,
    },
    {
      id: 4,
      clientName: "Laura García",
      clientId: 104,
      title: "Divorcio Amigable",
      type: "Asesoría Legal",
      status: "Completada",
      priority: "Alta",
      createdDate: "2023-11-01",
      dueDate: "2023-12-15",
      description: "Proceso de divorcio de mutuo acuerdo con división de bienes.",
      progress: 100,
    },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setNewCase((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (value: string, id: string) => {
    setNewCase((prev) => ({ ...prev, [id]: value }))
  }

  const handleCreateCase = () => {
    console.log("New Case:", newCase)
    // Here you would typically send this data to your backend
    // and then refresh the cases list.
    setNewCase({
      title: "",
      description: "",
      type: "",
      priority: "",
      client: "",
      dueDate: "",
    })
  }

  const handleViewCase = (caseItem: AdvisorCase) => {
    setSelectedCase(caseItem)
  }

  const handleCloseCaseView = () => {
    setSelectedCase(null)
  }

  const filteredAdvisorCases = advisorCases.filter(
    (caseItem) =>
      (caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.clientName.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === "all" || caseItem.status.toLowerCase() === filterStatus.toLowerCase()) &&
      (filterPriority === "all" || caseItem.priority.toLowerCase() === filterPriority.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Mis Casos</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Caso
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Caso</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Título
                </Label>
                <Input id="title" value={newCase.title} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  value={newCase.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Tipo
                </Label>
                <Select value={newCase.type} onValueChange={(value) => handleSelectChange(value, "type")}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asesoria_legal">Asesoría Legal</SelectItem>
                    <SelectItem value="asesoria_financiera">Asesoría Financiera</SelectItem>
                    <SelectItem value="relaciones_familiares">Relaciones Familiares</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client" className="text-right">
                  Cliente
                </Label>
                <Input
                  id="client"
                  value={newCase.client}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Nombre del Cliente"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  Prioridad
                </Label>
                <Select value={newCase.priority} onValueChange={(value) => handleSelectChange(value, "priority")}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right">
                  Fecha Límite
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newCase.dueDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={handleCreateCase}>Crear Caso</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar casos..."
            className="w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="en progreso">En Progreso</SelectItem>
            <SelectItem value="programada">Programada</SelectItem>
            <SelectItem value="en revision">En Revisión</SelectItem>
            <SelectItem value="completada">Completada</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-full md:w-[180px]">
            <ChevronDown className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar por prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las prioridades</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="baja">Baja</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdvisorCases.map((caseItem) => (
          <Card key={caseItem.id} className="border-border/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">{caseItem.title}</CardTitle>
              <Badge
                className={`px-2 py-1 text-xs ${
                  caseItem.status === "En Progreso"
                    ? "bg-blue-500/20 text-blue-400"
                    : caseItem.status === "Programada"
                      ? "bg-orange-500/20 text-orange-400"
                      : caseItem.status === "Completada"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {caseItem.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Cliente: {caseItem.clientName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Creado: {caseItem.createdDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Fecha Límite: {caseItem.dueDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span
                  className={`font-medium ${
                    caseItem.priority === "Alta"
                      ? "text-red-500"
                      : caseItem.priority === "Media"
                        ? "text-yellow-500"
                        : "text-green-500"
                  }`}
                >
                  Prioridad: {caseItem.priority}
                </span>
              </div>
              <Progress value={caseItem.progress} className="w-full" />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleViewCase(caseItem)}>
                  <MessageSquare className="w-4 h-4" />
                  <span className="sr-only">Ver Detalles</span>
                </Button>
                <Button variant="ghost" size="icon">
                  <Edit className="w-4 h-4" />
                  <span className="sr-only">Editar Caso</span>
                </Button>
                <Button variant="ghost" size="icon">
                  <Trash2 className="w-4 h-4" />
                  <span className="sr-only">Eliminar Caso</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCase && (
        <Dialog open={!!selectedCase} onOpenChange={handleCloseCaseView}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedCase.title}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p>
                <strong>Cliente:</strong> {selectedCase.clientName}
              </p>
              <p>
                <strong>Tipo:</strong> {selectedCase.type}
              </p>
              <p>
                <strong>Estado:</strong> <Badge>{selectedCase.status}</Badge>
              </p>
              <p>
                <strong>Prioridad:</strong> {selectedCase.priority}
              </p>
              <p>
                <strong>Descripción:</strong> {selectedCase.description}
              </p>
              <p>
                <strong>Fecha de Creación:</strong> {selectedCase.createdDate}
              </p>
              <p>
                <strong>Fecha Límite:</strong> {selectedCase.dueDate}
              </p>
              <p>
                <strong>Progreso:</strong> {selectedCase.progress}%
              </p>
              <Progress value={selectedCase.progress} className="w-full" />
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={handleCloseCaseView}>Cerrar</Button>
              <Button variant="outline">Editar</Button>
              <Button variant="destructive">Eliminar</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
