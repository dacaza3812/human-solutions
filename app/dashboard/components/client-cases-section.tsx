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
import { Plus, Search, Filter, MessageSquare, Calendar } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

interface ClientCase {
  id: number
  title: string
  type: string
  status: string
  advisor: string
  advisorAvatar: string
  description: string
  createdDate: string
  nextAppointment: string | null
  progress: number
}

export function ClientCasesSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [newCase, setNewCase] = useState({
    title: "",
    description: "",
    type: "",
  })
  const [selectedCase, setSelectedCase] = useState<ClientCase | null>(null)

  // Mock data for client's cases
  const clientCases: ClientCase[] = [
    {
      id: 1,
      title: "Asesoría Financiera Personal",
      type: "Asesoría Financiera",
      status: "En Progreso",
      advisor: "Dr. María González",
      advisorAvatar: "/placeholder-user.jpg",
      description:
        "Planificación presupuestaria y estrategias de ahorro para mejorar la situación financiera familiar.",
      createdDate: "2024-01-15",
      nextAppointment: "2024-01-25 10:00 AM",
      progress: 65,
    },
    {
      id: 2,
      title: "Mediación Familiar",
      type: "Relaciones Familiares",
      status: "Programada",
      advisor: "Lic. Carlos Rodríguez",
      advisorAvatar: "/placeholder-user.jpg",
      description: "Resolución de conflictos familiares y mejora de la comunicación entre miembros de la familia.",
      createdDate: "2024-01-10",
      nextAppointment: "2024-01-20 2:30 PM",
      progress: 25,
    },
    {
      id: 3,
      title: "Consulta Legal",
      type: "Asesoría Legal",
      status: "Completada",
      advisor: "Abg. Ana Martínez",
      advisorAvatar: "/placeholder-user.jpg",
      description: "Consulta sobre derechos laborales y procedimientos legales.",
      createdDate: "2023-12-20",
      nextAppointment: null,
      progress: 100,
    },
    {
      id: 4,
      title: "Planificación de Herencia",
      type: "Asesoría Legal",
      status: "Pendiente",
      advisor: "Abg. Ana Martínez",
      advisorAvatar: "/placeholder-user.jpg",
      description: "Asesoría para la creación de un testamento y planificación de herencia.",
      createdDate: "2024-02-01",
      nextAppointment: "2024-02-10 11:00 AM",
      progress: 10,
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
    })
  }

  const handleViewCase = (caseItem: ClientCase) => {
    setSelectedCase(caseItem)
  }

  const handleCloseCaseView = () => {
    setSelectedCase(null)
  }

  const filteredClientCases = clientCases.filter(
    (caseItem) =>
      caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterStatus === "all" || caseItem.status.toLowerCase() === filterStatus.toLowerCase()),
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
            <SelectItem value="completada">Completada</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClientCases.map((caseItem) => (
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
                <Avatar className="w-6 h-6">
                  <AvatarImage src={caseItem.advisorAvatar || "/placeholder.svg"} />
                  <AvatarFallback>{caseItem.advisor.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>Asesor: {caseItem.advisor}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Creado: {caseItem.createdDate}</span>
              </div>
              {caseItem.nextAppointment && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Próxima Cita: {caseItem.nextAppointment}</span>
                </div>
              )}
              <Progress value={caseItem.progress} className="w-full" />
              <div className="flex justify-end">
                <Button variant="ghost" size="icon" onClick={() => handleViewCase(caseItem)}>
                  <MessageSquare className="w-4 h-4" />
                  <span className="sr-only">Ver Detalles</span>
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
                <strong>Asesor:</strong> {selectedCase.advisor}
              </p>
              <p>
                <strong>Tipo:</strong> {selectedCase.type}
              </p>
              <p>
                <strong>Estado:</strong> <Badge>{selectedCase.status}</Badge>
              </p>
              <p>
                <strong>Descripción:</strong> {selectedCase.description}
              </p>
              <p>
                <strong>Fecha de Creación:</strong> {selectedCase.createdDate}
              </p>
              {selectedCase.nextAppointment && (
                <p>
                  <strong>Próxima Cita:</strong> {selectedCase.nextAppointment}
                </p>
              )}
              <p>
                <strong>Progreso:</strong> {selectedCase.progress}%
              </p>
              <Progress value={selectedCase.progress} className="w-full" />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCloseCaseView}>Cerrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
