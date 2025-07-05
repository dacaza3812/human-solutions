"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function PasswordSettings() {
  const { updatePassword } = useAuth()
  const { toast } = useToast()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      })
      return
    }
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const { error } = await updatePassword(newPassword)
    setLoading(false)

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Éxito",
        description: "Contraseña actualizada correctamente.",
      })
      setNewPassword("")
      setConfirmPassword("")
    }
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
