import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase-server"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default async function UpcomingAppointmentsCard() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <p>Por favor, inicia sesión para ver tus citas.</p>
  }

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("*, client:client_id(name), advisor:advisor_id(name)")
    .or(`client_id.eq.${user.id},advisor_id.eq.${user.id}`)
    .gte("start_time", new Date().toISOString()) // Only future appointments
    .order("start_time", { ascending: true })
    .limit(3) // Show only the next 3 appointments

  if (error) {
    console.error("Error fetching appointments:", error)
    return <p>Error al cargar las citas: {error.message}</p>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Próximas Citas</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-muted-foreground">No tienes citas próximas.</p>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-bold">
                    {format(new Date(appointment.start_time), "dd", { locale: es })}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{appointment.title || "Cita de Asesoría"}</p>
                  <p className="text-xs text-muted-foreground">
                    Con: {appointment.client_id === user.id ? appointment.advisor?.name : appointment.client?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(appointment.start_time), "PPP p", { locale: es })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <Button variant="link" className="p-0 h-auto mt-4 text-emerald-400">
          Ver Calendario Completo <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  )
}
