"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "@supabase/supabase-js"

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
  user: User | null
  profile: UserProfile | null
}

export function UserInfoCard({ user, profile }: UserInfoCardProps) {
  return (
    <Card className="border-border/40">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Información del Usuario</CardTitle>
        <User className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
            <AvatarFallback>
              {profile?.first_name ? profile.first_name[0] : ""}
              {profile?.last_name ? profile.last_name[0] : ""}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {profile?.first_name} {profile?.last_name}
            </p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-sm text-muted-foreground capitalize">Tipo de Cuenta: {profile?.account_type}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
