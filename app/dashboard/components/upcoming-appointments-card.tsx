import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase-server"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

export default async function UpcomingAppointmentsCard() {
  const supabase = createClient()
  // In a real app, you'd fetch appointments relevant to the user/advisor
  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("*")
    .limit(3)
    .order("start_time", { ascending: true })

  if (error) {
    console.error("Error fetching appointments:", error)
    return <p>Error loading appointments.</p>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Próximas Citas</CardTitle>
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay citas próximas.</p>
        ) : (
          <ul className="space-y-3">
            {appointments.map((appointment) => (
              <li key={appointment.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{appointment.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {appointment.client_name || "Cliente"}{" "}
                    {format(parseISO(appointment.start_time), "dd MMM, hh:mm a", { locale: es })}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    appointment.status === "scheduled"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : appointment.status === "completed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {appointment.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
