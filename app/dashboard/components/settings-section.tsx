"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { UserProfile } from "@/contexts/auth-context" // Import the UserProfile type

interface SettingsSectionProps {
  profile: UserProfile | null
  firstName: string
  setFirstName: (value: string) => void
  lastName: string
  setLastName: (value: string) => void
  phone: string
  setPhone: (value: string) => void
  newReferralCode: string
  setNewReferralCode: (value: string) => void
  currentPassword?: string
  setCurrentPassword: (value: string) => void
  newPassword: string
  setNewPassword: (value: string) => void
  confirmNewPassword: string
  setConfirmNewPassword: (value: string) => void
  handleProfileUpdate: () => Promise<void>
  handlePasswordChange: () => Promise<void>
  handleReferralCodeUpdate: () => Promise<void>
  isProfileUpdating: boolean
  isPasswordUpdating: boolean
  isReferralCodeUpdating: boolean
}

export function SettingsSection({
  profile,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  phone,
  setPhone,
  newReferralCode,
  setNewReferralCode,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  handleProfileUpdate,
  handlePasswordChange,
  handleReferralCodeUpdate,
  isProfileUpdating,
  isPasswordUpdating,
  isReferralCodeUpdating,
}: SettingsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Perfil</CardTitle>
          <CardDescription>Actualiza tu nombre, apellido y número de teléfono.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={profile?.email || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button onClick={handleProfileUpdate} disabled={isProfileUpdating}>
            {isProfileUpdating ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Cambiar Contraseña</CardTitle>
          <CardDescription>Actualiza tu contraseña para mayor seguridad.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Contraseña Actual</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva Contraseña</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Confirmar Nueva Contraseña</Label>
            <Input
              id="confirmNewPassword"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>
          <Button onClick={handlePasswordChange} disabled={isPasswordUpdating}>
            {isPasswordUpdating ? "Cambiando..." : "Cambiar Contraseña"}
          </Button>
        </CardContent>
      </Card>

      {/* Referral Code Settings (only for clients) */}
      {profile?.account_type === "client" && (
        <Card>
          <CardHeader>
            <CardTitle>Código de Referido</CardTitle>
            <CardDescription>Gestiona tu código de referido personal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="referralCode">Tu Código de Referido</Label>
              <Input id="referralCode" value={newReferralCode} onChange={(e) => setNewReferralCode(e.target.value)} />
            </div>
            <Button onClick={handleReferralCodeUpdate} disabled={isReferralCodeUpdating}>
              {isReferralCodeUpdating ? "Actualizando..." : "Actualizar Código"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
