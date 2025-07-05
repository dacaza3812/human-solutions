"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Key } from "lucide-react"

interface PasswordSettingsProps {
  currentPassword: string
  setCurrentPassword: (value: string) => void
  newPassword: string
  setNewPassword: (value: string) => void
  confirmNewPassword: string
  setConfirmNewPassword: (value: string) => void
  passwordChangeMessage: string
  passwordChangeError: string
  handlePasswordChange: (e: React.FormEvent) => Promise<void>
}

export function PasswordSettings({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  passwordChangeMessage,
  passwordChangeError,
  handlePasswordChange,
}: PasswordSettingsProps) {
  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <Key className="w-5 h-5 mr-2 text-purple-400" />
          Cambiar Contraseña
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Contraseña Actual</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="newPassword">Nueva Contraseña</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
              required
            />
          </div>
          {passwordChangeError && <p className="text-red-500 text-sm">{passwordChangeError}</p>}
          {passwordChangeMessage && <p className="text-emerald-500 text-sm">{passwordChangeMessage}</p>}
          <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
            Actualizar Contraseña
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
