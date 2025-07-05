"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { CheckCircleIcon, XCircleIcon, Loader2 } from "lucide-react"

export function PasswordSettings() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const { changePassword } = useAuth()

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsChangingPassword(true)

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Error",
        description: "Las nuevas contraseñas no coinciden.",
        variant: "destructive",
        action: <XCircleIcon className="text-red-500" />,
      })
      setIsChangingPassword(false)
      return
    }
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La nueva contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
        action: <XCircleIcon className="text-red-500" />,
      })
      setIsChangingPassword(false)
      return
    }

    const { error } = await changePassword(newPassword)

    if (error) {
      toast({
        title: "Error",
        description: `Error al cambiar contraseña: ${error.message}`,
        variant: "destructive",
        action: <XCircleIcon className="text-red-500" />,
      })
    } else {
      toast({
        title: "Éxito",
        description: "Contraseña cambiada exitosamente.",
        action: <CheckCircleIcon className="text-green-500" />,
      })
      setNewPassword("")
      setConfirmNewPassword("")
    }
    setIsChangingPassword(false)
  }

  return (
    <form onSubmit={handlePasswordChange} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="new-password">Nueva Contraseña</Label>
        <Input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-new-password">Confirmar Nueva Contraseña</Label>
        <Input
          id="confirm-new-password"
          type="password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={isChangingPassword}>
        {isChangingPassword ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cambiando...
          </>
        ) : (
          "Cambiar Contraseña"
        )}
      </Button>
    </form>
  )
}
