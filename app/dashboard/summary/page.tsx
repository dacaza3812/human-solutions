"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarComponent } from "@/components/calendar-component"
import { FinancialCharts } from "@/components/financial-charts"
import { ChatInterface } from "@/components/chat-interface"
import { UserInfoCard } from "@/app/dashboard/components/user-info-card"
import { RecentActivityCard } from "@/app/dashboard/components/recent-activity-card"
import { UpcomingAppointmentsCard } from "@/app/dashboard/components/upcoming-appointments-card"
import { StatsGrid } from "@/app/dashboard/components/stats-grid"

interface Case {
  id: string
  title: string
  status: string
  last_updated: string
}

interface Client {
  id: string
  name: string
  email: string
  status: string
}

interface Appointment {
  id: string
  title: string
  date: string
  time: string
  client: string
}

export default function SummaryPage() {
  const { profile, loading: authLoading } = useAuth()
  const [cases, setCases] = useState<Case[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && profile) {
      fetchDashboardData()
    }
  }, [profile, authLoading])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Simulate fetching data based on profile type
      if (profile?.account_type === "advisor") {
        // Mock data for advisor
        setCases([
          { id: "1", title: "Divorcio Pérez", status: "Activo", last_updated: "2024-05-20" },
          { id: "2", title: "Herencia García", status: "Pendiente", last_updated: "2024-05-18" },
        ])
        setClients([
          { id: "101", name: "Juan Pérez", email: "juan@example.com", status: "Activo" },
          { id: "102", name: "Ana López", email: "ana@example.com", status: "Pendiente" },
        ])
        setAppointments([
          { id: "a1", title: "Reunión con Juan Pérez", date: "2024-06-01", time: "10:00 AM", client: "Juan Pérez" },
          { id: "a2", title: "Consulta Ana López", date: "2024-06-02", time: "02:00 PM", client: "Ana López" },
        ])
      } else {
        // Mock data for client
        setCases([
          { id: "3", title: "Mi Caso de Divorcio", status: "En Revisión", last_updated: "2024-05-22" },
          { id: "4", title: "Consulta Legal", status: "Completado", last_updated: "2024-05-15" },
        ])
        setAppointments([{ id: "a3", title: "Cita con Abogado", date: "2024-06-05", time: "11:00 AM", client: "N/A" }])
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
      setError("Failed to load dashboard data. Please try again.")
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

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <UserInfoCard profile={profile} />
      <RecentActivityCard />
      <UpcomingAppointmentsCard appointments={appointments} />
      <StatsGrid profileType={profile?.account_type || "client"} />

      {profile?.account_type === "advisor" && (
        <>
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Casos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Última Actualización</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.title}</TableCell>
                      <TableCell>{c.status}</TableCell>
                      <TableCell>{c.last_updated}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Clientes Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.status}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Ver Perfil
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle>Calendario</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent />
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-2">
            <CardHeader>
              <CardTitle>Resumen Financiero</CardTitle>
            </CardHeader>
            <CardContent>
              <FinancialCharts />
            </CardContent>
          </Card>
        </>
      )}

      {profile?.account_type === "client" && (
        <>
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Mis Casos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Última Actualización</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.title}</TableCell>
                      <TableCell>{c.status}</TableCell>
                      <TableCell>{c.last_updated}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Asistencia Rápida</CardTitle>
            </CardHeader>
            <CardContent>
              <ChatInterface />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
