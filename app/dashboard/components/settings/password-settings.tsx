"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client" // Client-side Supabase client

export default function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las nuevas contraseñas no coinciden.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    // In a real application, you would typically verify the current password
    // on the server side before allowing a password change.
    // Supabase's `updateUser` function doesn't directly verify the old password.
    // You might need a custom API route for this if strict verification is needed.

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error("Error updating password:", error)
      toast({
        title: "Error al actualizar contraseña",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada exitosamente.",
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cambiar Contraseña</CardTitle>
        <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="current-password">Contraseña Actual</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="new-password">Nueva Contraseña</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
