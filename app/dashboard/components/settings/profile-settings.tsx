"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client" // Client-side Supabase client
import { useAuth } from "@/contexts/auth-context"

export default function ProfileSettings() {
  const { user, profile, fetchUserProfile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "")
      setAvatarUrl(profile.avatar_url || "")
    }
  }, [profile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!user) {
      toast({
        title: "Error",
        description: "Usuario no autenticado.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    const updates = {
      id: user.id,
      full_name: fullName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("profiles").upsert(updates)

    if (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error al actualizar perfil",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Perfil actualizado",
        description: "Tu información de perfil ha sido guardada.",
      })
      fetchUserProfile() // Re-fetch profile to update context
    }
    setLoading(false)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Usuario no autenticado para subir avatar.",
        variant: "destructive",
      })
      return
    }

    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

    if (uploadError) {
      console.error("Error uploading avatar:", uploadError)
      toast({
        title: "Error al subir avatar",
        description: uploadError.message,
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath)
    const publicUrl = publicUrlData.publicUrl

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating avatar URL in profile:", updateError)
      toast({
        title: "Error al guardar URL del avatar",
        description: updateError.message,
        variant: "destructive",
      })
    } else {
      setAvatarUrl(publicUrl)
      toast({
        title: "Avatar actualizado",
        description: "Tu foto de perfil ha sido cambiada exitosamente.",
      })
      fetchUserProfile() // Re-fetch profile to update context
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Perfil</CardTitle>
        <CardDescription>Actualiza tu información personal y foto de perfil.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} alt={fullName || "User Avatar"} />
              <AvatarFallback>{fullName ? fullName[0] : "U"}</AvatarFallback>
            </Avatar>
            <div>
              <Input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              <Button
                type="button"
                onClick={() => document.getElementById("avatar-upload")?.click()}
                disabled={loading}
              >
                Cambiar Avatar
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="full-name">Nombre Completo</Label>
            <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={loading} />
          </div>
          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" value={user?.email || ""} disabled readOnly />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
