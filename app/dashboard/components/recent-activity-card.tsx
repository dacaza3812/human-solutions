import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"
import { createClient } from "@/lib/supabase-server"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export default async function RecentActivityCard() {
  const supabase = createClient()
  // In a real app, you'd fetch recent activities for the user/advisor
  const { data: activities, error } = await supabase.from("activity_log").select("*").limit(5)

  if (error) {
    console.error("Error fetching activities:", error)
    return <p>Error loading activity.</p>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Actividad Reciente</CardTitle>
        <Activity className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay actividad reciente.</p>
        ) : (
          <ul className="space-y-3">
            {activities.map((activity) => (
              <li key={activity.id} className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">{activity.description}</p>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: es })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
