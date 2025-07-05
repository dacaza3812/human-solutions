"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CalendarDays,
  Clock,
  Plus,
  Video,
  Phone,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react"

export default function QuotesPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const appointments = [
    {
      id: 1,
      title: "Consulta Financiera",
      type: "Asesoría Financiera",
      client: "Ana Martínez",
      advisor: "Dr. María González",
      date: "2024-01-25",
      time: "10:00 AM",
      duration: 60,
      status: "Confirmada",
      mode: "Videollamada",
      description: "Revisión de planificación presupuestaria y estrategias de ahorro",
      location: "Online",
      notes: "Cliente requiere documentos adicionales",
    },
    {
      id: 2,
      title: "Mediación Familiar",
      type: "Relaciones Familiares",
      client: "Familia Rodríguez",
      advisor: "Lic. Carlos Rodríguez",
      date: "2024-01-25",
      time: "2:30 PM",
      duration: 90,
      status: "Pendiente",
      mode: "Presencial",
      description: "Sesión de mediación para resolución de conflictos familiares",
      location: "Oficina Central - Sala 3",
      notes: "Ambas partes confirmaron asistencia",
    },
    {
      id: 3,
      title: "Consulta Legal",
      type: "Asesoría Legal",
      client: "Luis Fernández",
      advisor: "Abg. Ana Martínez",
      date: "2024-01-26",
      time: "11:00 AM",
      duration: 45,
      status: "Confirmada",
      mode: "Telefónica",
      description: "Consulta sobre derechos laborales y procedimientos legales",
      location: "Llamada telefónica",
      notes: "Preparar documentación legal relevante",
    },
    {
      id: 4,
      title: "Seguimiento Terapia",
      type: "Relaciones Familiares",
      client: "Roberto Silva",
      advisor: "Dra. Carmen Ruiz",
      date: "2024-01-26",
      time: "4:00 PM",
      duration: 60,
      status: "Cancelada",
      mode: "Videollamada",
      description: "Sesión de seguimiento de terapia de pareja",
      location: "Online",
      notes: "Cliente solicitó reprogramar",
    },
    {
      id: 5,
      title: "Planificación Patrimonial",
      type: "Asesoría Financiera",
      client: "Sofia Herrera",
      advisor: "Dr. Luis Fernández",
      date: "2024-01-27",
      time: "9:00 AM",
      duration: 120,
      status: "Confirmada",
      mode: "Presencial",
      description: "Revisión de estructura patrimonial y planificación sucesoria",
      location: "Oficina Central - Sala 1",
      notes: "Traer documentos patrimoniales actualizados",
    },
  ]

  const appointmentStats = {
    total: appointments.length,
    confirmed: appointments.filter((a) => a.status === "Confirmada").length,
    pending: appointments.filter((a) => a.status === "Pendiente").length,
    cancelled: appointments.filter((a) => a.status === "Cancelada").length,
  }

  const todayAppointments = appointments.filter((apt) => apt.date === "2024-01-25")
  const upcomingAppointments = appointments.filter((apt) => new Date(apt.date) > new Date("2024-01-25"))

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmada":
        return "bg-green-50 text-green-700 border-green-200"
      case "Pendiente":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "Cancelada":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "Videollamada":
        return <Video className="w-4 h-4" />
      case "Telefónica":
        return <Phone className="w-4 h-4" />
      case "Presencial":
        return <MapPin className="w-4 h-4" />
      default:
        return <CalendarDays className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Citas</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus citas y consultas programadas</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <CalendarDays className="w-4 h-4 mr-2" />
            Ver Calendario
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Cita
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Citas</CardTitle>
              <CalendarDays className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointmentStats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Esta semana</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Confirmadas</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointmentStats.confirmed}</div>
              <p className="text-xs text-muted-foreground mt-1">Listas para realizar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
              <Clock className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointmentStats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">Esperando confirmación</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Canceladas</CardTitle>
              <AlertCircle className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointmentStats.cancelled}</div>
              <p className="text-xs text-muted-foreground mt-1">Requieren reprogramación</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Calendario</CardTitle>
              <CardDescription>Selecciona una fecha para ver las citas</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Appointments List */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="today" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="today">Hoy</TabsTrigger>
                <TabsTrigger value="upcoming">Próximas</TabsTrigger>
                <TabsTrigger value="all">Todas</TabsTrigger>
              </TabsList>

              {/* Today's Appointments */}
              <TabsContent value="today" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Citas de Hoy</CardTitle>
                    <CardDescription>{todayAppointments.length} citas programadas para hoy</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {todayAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                              {getModeIcon(appointment.mode)}
                            </div>
                            <div>
                              <h3 className="font-medium">{appointment.title}</h3>
                              <p className="text-sm text-muted-foreground">{appointment.client}</p>
                              <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {appointment.time} ({appointment.duration}min)
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{appointment.location}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Upcoming Appointments */}
              <TabsContent value="upcoming" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Próximas Citas</CardTitle>
                    <CardDescription>{upcomingAppointments.length} citas programadas próximamente</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              {getModeIcon(appointment.mode)}
                            </div>
                            <div>
                              <h3 className="font-medium">{appointment.title}</h3>
                              <p className="text-sm text-muted-foreground">{appointment.client}</p>
                              <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <CalendarDays className="w-3 h-3" />
                                  <span>{appointment.date}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{appointment.time}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* All Appointments */}
              <TabsContent value="all" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Todas las Citas</CardTitle>
                    <CardDescription>Historial completo de citas programadas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {appointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                              {getModeIcon(appointment.mode)}
                            </div>
                            <div>
                              <h3 className="font-medium">{appointment.title}</h3>
                              <p className="text-sm text-muted-foreground">{appointment.client}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {appointment.description}
                              </p>
                              <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <CalendarDays className="w-3 h-3" />
                                  <span>{appointment.date}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{appointment.time}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <User className="w-3 h-3" />
                                  <span>{appointment.advisor}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <Badge variant="outline" className={getStatusColor(appointment.status)}>
                                {appointment.status}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">{appointment.mode}</p>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
