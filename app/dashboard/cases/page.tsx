"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Eye,
  Edit,
  MoreHorizontal,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import NewCaseForm from "@/app/dashboard/components/new-case-form" // Import the new form component

export default function CasesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const cases = [
    {
      id: 1,
      title: "Asesoría Financiera Personal",
      type: "Asesoría Financiera",
      status: "En Progreso",
      priority: "Alta",
      client: "Juan Pérez",
      advisor: "Dr. María González",
      createdDate: "2024-01-15",
      dueDate: "2024-02-15",
      progress: 65,
      description:
        "Planificación presupuestaria y estrategias de ahorro para mejorar la situación financiera familiar.",
      lastActivity: "Hace 2 horas",
      messages: 12,
    },
    {
      id: 2,
      title: "Mediación Familiar",
      type: "Relaciones Familiares",
      status: "Programada",
      priority: "Media",
      client: "María López",
      advisor: "Lic. Carlos Rodríguez",
      createdDate: "2024-01-10",
      dueDate: "2024-01-30",
      progress: 25,
      description: "Resolución de conflictos familiares y mejora de la comunicación entre miembros.",
      lastActivity: "Hace 1 día",
      messages: 8,
    },
    {
      id: 3,
      title: "Consulta Legal Empresarial",
      type: "Asesoría Legal",
      status: "En Revisión",
      priority: "Baja",
      client: "Carlos Mendoza",
      advisor: "Abg. Ana Martínez",
      createdDate: "2024-01-08",
      dueDate: "2024-01-25",
      progress: 80,
      description: "Consulta sobre derechos laborales y procedimientos legales para empresa.",
      lastActivity: "Hace 3 horas",
      messages: 15,
    },
    {
      id: 4,
      title: "Planificación Patrimonial",
      type: "Asesoría Financiera",
      status: "Completada",
      priority: "Alta",
      client: "Sofia Herrera",
      advisor: "Dr. Luis Fernández",
      createdDate: "2023-12-20",
      dueDate: "2024-01-20",
      progress: 100,
      description: "Estructuración de patrimonio familiar y planificación sucesoria.",
      lastActivity: "Hace 2 días",
      messages: 22,
    },
    {
      id: 5,
      title: "Terapia de Pareja",
      type: "Relaciones Familiares",
      status: "En Progreso",
      priority: "Media",
      client: "Roberto Silva",
      advisor: "Dra. Carmen Ruiz",
      createdDate: "2024-01-12",
      dueDate: "2024-02-12",
      progress: 45,
      description: "Sesiones de terapia para mejorar la comunicación en la pareja.",
      lastActivity: "Hace 5 horas",
      messages: 6,
    },
  ]

  const caseStats = {
    total: cases.length,
    active: cases.filter((c) => c.status === "En Progreso").length,
    completed: cases.filter((c) => c.status === "Completada").length,
    pending: cases.filter((c) => c.status === "Programada" || c.status === "En Revisión").length,
  }

  const filteredCases = cases.filter((case_item) => {
    const matchesSearch =
      case_item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      case_item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      case_item.type.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || case_item.status.toLowerCase().includes(statusFilter.toLowerCase())
    const matchesType = typeFilter === "all" || case_item.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En Progreso":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "Completada":
        return "bg-green-50 text-green-700 border-green-200"
      case "Programada":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "En Revisión":
        return "bg-purple-50 text-purple-700 border-purple-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "bg-red-50 text-red-700 border-red-200"
      case "Media":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "Baja":
        return "bg-green-50 text-green-700 border-green-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Casos</h1>
          <p className="text-muted-foreground mt-1">Gestiona todos tus casos y consultas</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros Avanzados
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Caso
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Caso</DialogTitle>
                <DialogDescription>Completa los detalles para iniciar un nuevo caso o consulta.</DialogDescription>
                <DialogDescription>Luego de enviar un caso, un especialista se pondrá en contacto con usted.</DialogDescription>
              </DialogHeader>
              <NewCaseForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Casos</CardTitle>
              <FileText className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{caseStats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Todos los casos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Casos Activos</CardTitle>
              <Clock className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{caseStats.active}</div>
              <p className="text-xs text-muted-foreground mt-1">En progreso</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Casos Completados</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{caseStats.completed}</div>
              <p className="text-xs text-muted-foreground mt-1">Finalizados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Casos Pendientes</CardTitle>
              <AlertCircle className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{caseStats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">Requieren atención</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros y Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por título, cliente o tipo..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="en progreso">En Progreso</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                  <SelectItem value="programada">Programada</SelectItem>
                  <SelectItem value="en revisión">En Revisión</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="Asesoría Financiera">Asesoría Financiera</SelectItem>
                  <SelectItem value="Relaciones Familiares">Relaciones Familiares</SelectItem>
                  <SelectItem value="Asesoría Legal">Asesoría Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cases List */}
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Vista de Lista</TabsTrigger>
            <TabsTrigger value="cards">Vista de Tarjetas</TabsTrigger>
          </TabsList>

          {/* List View */}
          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Casos</CardTitle>
                <CardDescription>
                  Mostrando {filteredCases.length} de {cases.length} casos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCases.map((case_item) => (
                    <div
                      key={case_item.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium truncate">{case_item.title}</h3>
                            <Badge variant="outline" className={getPriorityColor(case_item.priority)}>
                              {case_item.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{case_item.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{case_item.client}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Vence: {case_item.dueDate}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="w-3 h-3" />
                              <span>{case_item.messages} mensajes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <Badge variant="outline" className={getStatusColor(case_item.status)}>
                            {case_item.status}
                          </Badge>
                          <div className="mt-2 w-24">
                            <Progress value={case_item.progress} className="h-2" />
                            <span className="text-xs text-muted-foreground">{case_item.progress}%</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cards View */}
          <TabsContent value="cards" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCases.map((case_item) => (
                <Card key={case_item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={getStatusColor(case_item.status)}>
                        {case_item.status}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(case_item.priority)}>
                        {case_item.priority}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{case_item.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{case_item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium">{case_item.progress}%</span>
                      </div>
                      <Progress value={case_item.progress} className="h-2" />
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>Cliente: {case_item.client}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Vence: {case_item.dueDate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                        <span>{case_item.messages} mensajes</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
