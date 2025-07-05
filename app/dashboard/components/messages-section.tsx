import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase-server"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

export default async function MessagesSection() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <p>Por favor, inicia sesión para ver tus mensajes.</p>
  }

  // Fetch recent messages for the user's cases
  // This is a simplified example. In a real app, you'd likely fetch messages
  // directly related to the user's active cases or a dedicated message system.
  const { data: messages, error } = await supabase
    .from("messages")
    .select("*, cases(id, title)") // Select messages and related case title
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`) // Messages sent by or received by the user
    .order("created_at", { ascending: false })
    .limit(5) // Show only the 5 most recent messages

  if (error) {
    console.error("Error fetching messages:", error)
    return <p>Error al cargar los mensajes: {error.message}</p>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Mensajes Recientes</CardTitle>
        <MessageCircle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <p className="text-muted-foreground">No hay mensajes recientes.</p>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {/* You might want to display sender's avatar/initials here */}
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm">
                    {message.sender_id === user.id ? "Tú" : "A"} {/* Simple indicator */}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {message.sender_id === user.id ? "Tú" : "Asesor/Cliente"} en caso:{" "}
                    <Link href={`/dashboard/cases/${message.case_id}`} className="text-emerald-400 hover:underline">
                      {message.cases?.title || "N/A"}
                    </Link>
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{message.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(message.created_at), "PPP p", { locale: es })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <Button variant="link" className="p-0 h-auto mt-4 text-emerald-400">
          Ver todos los mensajes <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  )
}
