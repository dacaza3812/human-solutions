"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { Plus, Search, Eye, Edit, FileText } from "lucide-react"

interface Case {
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
  priority: string
  documents: string[]
  notes: string
}

interface CasesSectionProps {
  cases?: Case[]
}

export function CasesSection({ cases = [] }: CasesSectionProps) {
  const { profile } = useAuth()
  const [caseFilter, setCaseFilter] = useState("all")
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)

  // Mock data for cases
  const userCases: Case[] =
    cases.length > 0
      ? cases
      : [
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
            priority: "Alta",
            documents: ["Presupuesto_Familiar.pdf", "Plan_Ahorro.pdf"],
            notes: "Cliente muy comprometido con el proceso. Necesita seguimiento semanal.",
          },
          {
            id: 2,
            title: "Mediación Familiar",
            type: "Relaciones Familiares",
            status: "Programada",
            advisor: "Lic. Carlos Rodríguez",
            advisorAvatar: "/placeholder-user.jpg",
            description:
              "Resolución de conflictos familiares y mejora de la comunicación entre miembros de la familia.",
            createdDate: "2024-01-10",
            nextAppointment: "2024-01-20 2:30 PM",
            progress: 25,
            priority: "Media",
            documents: ["Acuerdo_Inicial.pdf"],
            notes: "Primera sesión programada. Ambas partes están dispuestas a colaborar.",
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
            priority: "Baja",
            documents: ["Dictamen_Legal.pdf", "Recomendaciones.pdf"],
            notes: "Caso resuelto satisfactoriamente. Cliente informado de sus derechos.",
          },
        ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "en progreso":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
      case "programada":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "completada":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "alta":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "media":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "baja":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            {profile?.account_type === "advisor" ? "Gestión de Casos" : "Mis Casos"}
          </h2>
          <p className="text-muted-foreground">
            {profile?.account_type === "advisor"
              ? "Administra todos los casos de tus clientes"
              : "Revisa el estado de tus consultas"}
          </p>
        </div>
        {profile?.account_type === "advisor" && (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Caso
          </Button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder="Buscar casos..." className="pl-10" />
        </div>
        <Select value={caseFilter} onValueChange={setCaseFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="progress">En Progreso</SelectItem>
            <SelectItem value="scheduled">Programados</SelectItem>
            <SelectItem value="completed">Completados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {userCases
          .filter((case_) => caseFilter === "all" || case_.status.toLowerCase().includes(caseFilter))
          .map((case_) => (
            <Card key={case_.id} className="border-border/40 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{case_.title}</h3>
                      <Badge className={getStatusColor(case_.status)}>{case_.status}</Badge>
                      <Badge className={getPriorityColor(case_.priority)}>{case_.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{case_.type}</p>
                    <p className="text-sm text-muted-foreground">{case_.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedCase(case_)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Detalles
                    </Button>
                    {profile?.account_type === "advisor" && (
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {profile?.account_type === "advisor" ? "Cliente" : "Asesor"}
                    </p>
                    <p className="font-medium">{case_.advisor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                    <p className="font-medium">{new Date(case_.createdDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Próxima Cita</p>
                    <p className="font-medium">{case_.nextAppointment || "No programada"}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso</span>
                    <span>{case_.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${case_.progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Case Details Modal */}
      {selectedCase && (
        <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCase.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Información General</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span>{selectedCase.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado:</span>
                      <Badge className={getStatusColor(selectedCase.status)}>{selectedCase.status}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prioridad:</span>
                      <Badge className={getPriorityColor(selectedCase.priority)}>{selectedCase.priority}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Asesor:</span>
                      <span>{selectedCase.advisor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progreso:</span>
                      <span>{selectedCase.progress}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Fechas Importantes</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Creado:</span>
                      <span>{new Date(selectedCase.createdDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Próxima Cita:</span>
                      <span>{selectedCase.nextAppointment || "No programada"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Descripción</h4>
                <p className="text-sm text-muted-foreground">{selectedCase.description}</p>
              </div>

              {selectedCase.documents && selectedCase.documents.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Documentos</h4>
                  <div className="space-y-2">
                    {selectedCase.documents.map((doc: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span>{doc}</span>
                        <Button size="sm" variant="outline">
                          Descargar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCase.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notas</h4>
                  <p className="text-sm text-muted-foreground">{selectedCase.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
