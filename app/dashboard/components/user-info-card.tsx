"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOutIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

interface UserInfoCardProps {
  username: string
  avatarUrl: string
  userRole: string
}

export function UserInfoCard({ username, avatarUrl, userRole }: UserInfoCardProps) {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} alt={username} />
          <AvatarFallback className="text-4xl">{username ? username[0].toUpperCase() : "U"}</AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-bold">{username}</h2>
        <p className="text-sm text-muted-foreground capitalize">{userRole}</p>
        <Button variant="outline" className="mt-4 bg-transparent" onClick={handleSignOut}>
          <LogOutIcon className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </CardContent>
    </Card>
  )
}
