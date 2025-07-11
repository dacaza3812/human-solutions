"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Mail, Phone, CalendarDays } from "lucide-react"
import type { User as AuthUser } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  first_name?: string | null
  last_name?: string | null
  account_type?: string | null
  phone?: string | null
  created_at?: string | null
  referral_code?: string | null
  stripe_customer_id?: string | null
}

interface UserInfoCardProps {
  user: AuthUser | null
  profile: UserProfile | null
}

export function UserInfoCard({ user, profile }: UserInfoCardProps) {
  const joinDate = profile?.created_at ? new Date(profile.created_at).toLocaleDateString("es-ES") : "N/A"

  return (
    <Card className="border-border/40">
      <CardContent className="flex flex-col md:flex-row items-center p-6 gap-6">
        <Avatar className="w-24 h-24 border-2 border-primary">
          <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder-user.jpg"} />
          <AvatarFallback>{profile?.first_name?.charAt(0) || user?.email?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl font-bold text-foreground">
            {profile?.first_name} {profile?.last_name}
          </h3>
          <p className="text-muted-foreground text-lg capitalize">{profile?.account_type || "Usuario"}</p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center md:justify-start text-muted-foreground">
              <Mail className="w-4 h-4 mr-2" />
              <span>{user?.email || "N/A"}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start text-muted-foreground">
              <Phone className="w-4 h-4 mr-2" />
              <span>{profile?.phone || "N/A"}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start text-muted-foreground">
              <CalendarDays className="w-4 h-4 mr-2" />
              <span>Miembro desde: {joinDate}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4 md:mt-0">
          <Button variant="outline">Editar Perfil</Button>
          <Button variant="secondary">Ver Historial</Button>
        </div>
      </CardContent>
    </Card>
  )
}
