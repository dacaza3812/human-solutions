"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle } from "lucide-react"

interface UserProfile {
  id: string
  first_name?: string | null
  last_name?: string | null
  account_type?: string | null
  phone?: string | null
  created_at?: string | null
  referral_code?: string | null
  stripe_customer_id?: string | null
}

interface SettingsSectionProps {
  currentPassword: string
  setCurrentPassword: (value: string) => void
  newPassword: string
  setNewPassword: (value: string) => void
  confirmNewPassword: string
  setConfirmNewPassword: (value: string) => void
  passwordChangeMessage: string
  setPasswordChangeMessage: (value: string) => void
  passwordChangeError: string
  setPasswordChangeError: (value: string) => void
  handlePasswordChange: (e: React.FormEvent) => Promise<void>
  firstName: string
  setFirstName: (value: string) => void
  lastName: string
  setLastName: (value: string) => void
  profileUpdateMessage: string
  setProfileUpdateMessage: (value: string) => void
  profileUpdateError: string
  setProfileUpdateError: (value: string) => void
  handleProfileUpdate: (e: React.FormEvent) => Promise<void>
  newReferralCode: string
  setNewReferralCode: (value: string) => void
  referralCodeUpdateMessage: string
  setReferralCodeUpdateMessage: (value: string) => void
  referralCodeUpdateError: string
  setReferralCodeUpdateError: (value: string) => void
  handleReferralCodeUpdate: (e: React.FormEvent) => Promise<void>
  profile: UserProfile | null
}

export function SettingsSection({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  passwordChangeMessage,
  setPasswordChangeMessage,
  passwordChangeError,
  setPasswordChangeError,
  handlePasswordChange,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  profileUpdateMessage,
  setProfileUpdateMessage,
  profileUpdateError,
  setProfileUpdateError,
  handleProfileUpdate,
  newReferralCode,
  setNewReferralCode,
  referralCodeUpdateMessage,
  setReferralCodeUpdateMessage,
  referralCodeUpdateError,
  setReferralCodeUpdateError,
  handleReferralCodeUpdate,
  profile,
}: SettingsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Configuración</h2>
          <p className="text-muted-foreground">Gestiona la configuración de tu cuenta y perfil.</p>
        </div>
      </div>

      {/* Profile Settings */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Información del Perfil</CardTitle>
          <CardDescription>Actualiza tu nombre y apellido.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>
            {profileUpdateMessage && (
              <Alert className="bg-green-100 border-green-400 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Éxito</AlertTitle>
                <AlertDescription>{profileUpdateMessage}</AlertDescription>
              </Alert>
            )}
            {profileUpdateError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{profileUpdateError}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
              Guardar Cambios
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Cambiar Contraseña</CardTitle>
          <CardDescription>Actualiza tu contraseña para mayor seguridad.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
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
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </div>
            {passwordChangeMessage && (
              <Alert className="bg-green-100 border-green-400 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Éxito</AlertTitle>
                <AlertDescription>{passwordChangeMessage}</AlertDescription>
              </Alert>
            )}
            {passwordChangeError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{passwordChangeError}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
              Cambiar Contraseña
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Referral Code Settings (only for clients) */}
      {profile?.account_type === "client" && (
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Código de Referido</CardTitle>
            <CardDescription>Gestiona tu código de referido personal.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReferralCodeUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="referralCode">Tu Código de Referido</Label>
                <Input
                  id="referralCode"
                  value={newReferralCode}
                  onChange={(e) => setNewReferralCode(e.target.value)}
                  required
                />
              </div>
              {referralCodeUpdateMessage && (
                <Alert className="bg-green-100 border-green-400 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Éxito</AlertTitle>
                  <AlertDescription>{referralCodeUpdateMessage}</AlertDescription>
                </Alert>
              )}
              {referralCodeUpdateError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{referralCodeUpdateError}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
                Actualizar Código
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
