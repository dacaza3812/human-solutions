"use client"

import type React from "react"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle } from "lucide-react"

export function PasswordSettings() {
  const { changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setIsError(false)

    if (newPassword !== confirmNewPassword) {
      setMessage("Las nuevas contraseñas no coinciden.")
      setIsError(true)
      return
    }
    if (newPassword.length < 6) {
      setMessage("La nueva contraseña debe tener al menos 6 caracteres.")
      setIsError(true)
      return
    }

    // Note: Supabase's changePassword function typically only requires the new password
    // and handles re-authentication internally if needed. If you need to verify
    // the current password, you'd typically do a re-authentication step first.
    const { error } = await changePassword(newPassword)

    if (error) {
      setMessage(`Error al cambiar contraseña: ${error.message}`)
      setIsError(true)
    } else {
      setMessage("Contraseña cambiada exitosamente.")
      setIsError(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <Alert variant={isError ? "destructive" : "default"}>
          {isError ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertTitle>{isError ? "Error" : "Éxito"}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      {/* Current password input is typically not needed for Supabase's update user password,
          but kept here if your auth flow requires re-authentication first.
          If not, you can remove this field. */}
      <div>
        <Label htmlFor="currentPassword">Contraseña Actual</Label>
        <Input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mt-1"
          disabled // Disable if not used for direct verification
        />
      </div>
      <div>
        <Label htmlFor="newPassword">Nueva Contraseña</Label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1"
          required
        />
      </div>
      <div>
        <Label htmlFor="confirmNewPassword">Confirmar Nueva Contraseña</Label>
        <Input
          id="confirmNewPassword"
          type="password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          className="mt-1"
          required
        />
      </div>
      <Button type="submit">Cambiar Contraseña</Button>
    </form>
  )
}
