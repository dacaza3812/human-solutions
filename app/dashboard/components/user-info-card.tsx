import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase-server"

export default async function UserInfoCard() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return <p>Error loading user info.</p>
  }

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Bienvenido, {profile?.full_name || "Usuario"}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={profile?.avatar_url || "/placeholder-user.jpg"} alt={profile?.full_name || "User Avatar"} />
          <AvatarFallback className="text-4xl">{profile?.full_name ? profile.full_name[0] : "U"}</AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-semibold">{profile?.full_name || "Nombre de Usuario"}</h3>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        <p className="text-sm text-muted-foreground mt-2">Rol: {profile?.role || "Cliente"}</p>
      </CardContent>
    </Card>
  )
}
