"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function ProfileSettings() {
  const { user, updateProfile, fetchProfile } = useAuth()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const profile = await fetchProfile(user.id)
        if (profile) {
          setName(profile.name || "")
        }
      }
    }
    loadProfile()
  }, [user, fetchProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    if (user) {
      const { error } = await updateProfile(user.id, { name })
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Éxito",
          description: "Perfil actualizado correctamente.",
        })
      }
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Perfil</CardTitle>
        <CardDescription>Actualiza tu nombre y dirección de correo electrónico.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" value={user?.email || ""} disabled />
            <p className="text-sm text-muted-foreground mt-1">
              El correo electrónico no se puede cambiar directamente aquí.
            </p>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
