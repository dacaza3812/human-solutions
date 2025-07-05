import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"
import { createClient } from "@/lib/supabase-server"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default async function RecentActivityCard() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <p>Por favor, inicia sesión para ver la actividad reciente.</p>
  }

  // Fetch recent activities related to the user (e.g., new cases, messages, status updates)
  // This is a simplified example. A real activity feed would require a more robust logging system.
  const { data: cases, error: casesError } = await supabase
    .from("cases")
    .select("id, title, status, created_at, updated_at, client_id, advisor_id")
    .or(`client_id.eq.${user.id},advisor_id.eq.${user.id}`)
    .order("updated_at", { ascending: false })
    .limit(5)

  if (casesError) {
    console.error("Error fetching recent cases for activity:", casesError)
    return <p>Error al cargar la actividad reciente: {casesError.message}</p>
  }

  const activities = cases.map((caseItem) => ({
    id: caseItem.id,
    description: `Caso "${caseItem.title}" actualizado a estado: ${caseItem.status === "open" ? "Abierto" : caseItem.status === "in_progress" ? "En Progreso" : "Cerrado"}.`,
    timestamp: caseItem.updated_at,
  }))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Actividad Reciente</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-muted-foreground">No hay actividad reciente.</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2" />
                <div>
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(activity.timestamp), "PPP p", { locale: es })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
