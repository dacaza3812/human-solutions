"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { CheckCircleIcon, XCircleIcon, Loader2 } from "lucide-react"

export function ProfileSettings() {
  const { user, profile, updateUserProfile } = useAuth()
  const [firstName, setFirstName] = useState(profile?.first_name || "")
  const [lastName, setLastName] = useState(profile?.last_name || "")
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "")
      setLastName(profile.last_name || "")
    }
  }, [profile])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProfile(true)

    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Error",
        description: "El nombre y apellido no pueden estar vacíos.",
        variant: "destructive",
        action: <XCircleIcon className="text-red-500" />,
      })
      setIsUpdatingProfile(false)
      return
    }

    const { error } = await updateUserProfile({ first_name: firstName, last_name: lastName })

    if (error) {
      toast({
        title: "Error",
        description: `Error al actualizar perfil: ${error.message}`,
        variant: "destructive",
        action: <XCircleIcon className="text-red-500" />,
      })
    } else {
      toast({
        title: "Éxito",
        description: "Información de perfil actualizada exitosamente.",
        action: <CheckCircleIcon className="text-green-500" />,
      })
    }
    setIsUpdatingProfile(false)
  }

  return (
    <form onSubmit={handleProfileUpdate} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="first-name">Nombre</Label>
        <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="last-name">Apellido</Label>
        <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={user?.email || ""} disabled />
        <p className="text-sm text-muted-foreground">El email no puede ser cambiado aquí.</p>
      </div>
      <Button type="submit" disabled={isUpdatingProfile}>
        {isUpdatingProfile ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Actualizando...
          </>
        ) : (
          "Actualizar Perfil"
        )}
      </Button>
    </form>
  )
}
