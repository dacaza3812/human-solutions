"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { User } from "@supabase/supabase-js"

// Define un tipo para el perfil de usuario si no existe
interface UserProfile {
  id: string
  first_name?: string | null
  last_name?: string | null
  account_type?: string | null
  phone?: string | null
  created_at?: string | null
  referral_code?: string | null
  stripe_customer_id?: string | null
  // Añade cualquier otro campo de perfil que uses
}

interface UserInfoCardProps {
  user: User | null
  profile: UserProfile | null
}

export function UserInfoCard({ user, profile }: UserInfoCardProps) {
  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="text-foreground">Información de la Cuenta</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Correo Electrónico</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tipo de Cuenta</p>
            <p className="font-medium capitalize">{profile?.account_type}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Teléfono</p>
            <p className="font-medium">{profile?.phone || "No especificado"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fecha de Registro</p>
            <p className="font-medium">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
