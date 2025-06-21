"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, CalendarIcon, Clock, Video, Phone, User, Edit } from "lucide-react"

interface Appointment {
  id: number
  title: string
  date: string
  time: string
  duration: string
  type: string
  status: string
  client: string
  notes: string
}

interface AppointmentsSectionProps {
  appointments?: Appointment[]
}

export function AppointmentsSection({ appointments = [] }: AppointmentsSectionProps) {
  // Mock data for appointments
  const defaultAppointments: Appointment[] =
    appointments.length > 0
      ? appointments
      : [
          {
            id: 1,
            title: "Consulta Financiera - Juan Pérez",
            date: "2024-01-25",
            time: "10:00 AM",
            duration: "1 hora",
            type: "Presencial",
            status: "Confirmada",
            client: "Juan Pérez",
            notes: "Revisión de presupuesto mensual",
          },
          {
            id: 2,
            title: "Mediación Familiar - María García",
            date: "2024-01-20",
            time: "2:30 PM",
            duration: "2 horas",
            type: "Virtual",
            status: "Pendiente",
            client: "María García",
            notes: "Primera sesión de mediación",
          },
          {
            id: 3,
            title: "Seguimiento Legal - Carlos López",
            date: "2024-01-22",
            time: "11:00 AM",
            duration: "30 minutos",
            type: "Telefónica",
            status: "Completada",
            client: "Carlos López",
            notes: "Revisión de documentos legales",
          },
        ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmada":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "completada":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "cancelada":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Mis Citas</h2>
          <p className="text-muted-foreground">Gestiona tus citas programadas</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {defaultAppointments.map((appointment) => (
          <Card key={appointment.id} className="border-border/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{appointment.title}</h3>
                    <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(appointment.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {appointment.type === "Virtual" ? (
                        <Video className="w-4 h-4 text-muted-foreground" />
                      ) : appointment.type === "Telefónica" ? (
                        <Phone className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <User className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span>{appointment.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{appointment.duration}</span>
                    </div>
                  </div>
                  {appointment.notes && <p className="text-sm text-muted-foreground mt-2">{appointment.notes}</p>}
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  {appointment.type === "Virtual" && (
                    <Button size="sm">
                      <Video className="w-4 h-4 mr-1" />
                      Unirse
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
