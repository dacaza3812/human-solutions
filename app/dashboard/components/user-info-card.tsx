import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase-server"

export default async function UserInfoCard() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <p>Por favor, inicia sesión para ver tu información.</p>
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("name, avatar_url, role")
    .eq("id", user.id)
    .single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return <p>Error al cargar la información del usuario: {error.message}</p>
  }

  const userInitials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.[0]?.toUpperCase() || "U"

  return (
    <Card className="bg-card/50">
      <CardContent className="flex flex-col items-center p-6">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={profile?.avatar_url || "/placeholder-user.jpg"} alt={profile?.name || "User Avatar"} />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold text-foreground">{profile?.name || "Usuario"}</h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <p className="text-sm text-emerald-400 mt-2">{profile?.role === "advisor" ? "Asesor" : "Cliente"}</p>
      </CardContent>
    </Card>
  )
}
