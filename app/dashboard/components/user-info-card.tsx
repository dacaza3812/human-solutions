"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import type { UserProfile } from "@/contexts/auth-context"

interface UserInfoCardProps {
  profile: UserProfile | null
}

export function UserInfoCard({ profile }: UserInfoCardProps) {
  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Bienvenido, {profile?.first_name || "Usuario"}</CardTitle>
        <User className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
            <AvatarFallback>
              {profile?.first_name ? profile.first_name[0] : "U"}
              {profile?.last_name ? profile.last_name[0] : "N"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-2xl font-bold">
              {profile?.first_name} {profile?.last_name}
            </p>
            <p className="text-sm text-muted-foreground capitalize">{profile?.account_type || "Tipo de Cuenta"}</p>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
