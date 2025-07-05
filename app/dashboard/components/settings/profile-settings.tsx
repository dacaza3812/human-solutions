"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { UserRound } from "lucide-react"

interface ProfileSettingsProps {
  firstName: string
  setFirstName: (value: string) => void
  lastName: string
  setLastName: (value: string) => void
  profileUpdateMessage: string
  profileUpdateError: string
  handleProfileUpdate: (e: React.FormEvent) => Promise<void>
}

export function ProfileSettings({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  profileUpdateMessage,
  profileUpdateError,
  handleProfileUpdate,
}: ProfileSettingsProps) {
  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <UserRound className="w-5 h-5 mr-2 text-blue-400" />
          Actualizar Información de Perfil
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <Label htmlFor="firstName">Nombre</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Apellido</Label>
            <Input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          {profileUpdateError && <p className="text-red-500 text-sm">{profileUpdateError}</p>}
          {profileUpdateMessage && <p className="text-emerald-500 text-sm">{profileUpdateMessage}</p>}
          <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
            Guardar Cambios
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
