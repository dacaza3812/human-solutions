"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle } from "lucide-react"

export function ProfileSettings() {
  const { profile, updateUserProfile } = useAuth()
  const [firstName, setFirstName] = useState(profile?.first_name || "")
  const [lastName, setLastName] = useState(profile?.last_name || "")
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "")
      setLastName(profile.last_name || "")
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setIsError(false)

    if (!firstName.trim() || !lastName.trim()) {
      setMessage("El nombre y apellido no pueden estar vacíos.")
      setIsError(true)
      return
    }

    const { error } = await updateUserProfile({ first_name: firstName, last_name: lastName })

    if (error) {
      setMessage(`Error al actualizar perfil: ${error.message}`)
      setIsError(true)
    } else {
      setMessage("Información de perfil actualizada exitosamente.")
      setIsError(false)
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
      <div>
        <Label htmlFor="firstName">Nombre</Label>
        <Input
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="mt-1"
          required
        />
      </div>
      <div>
        <Label htmlFor="lastName">Apellido</Label>
        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1" required />
      </div>
      <Button type="submit">Guardar Cambios</Button>
    </form>
  )
}
