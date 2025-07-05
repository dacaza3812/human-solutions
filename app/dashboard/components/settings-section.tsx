"use client"

import type React from "react"
import { PasswordSettings } from "./settings/password-settings"
import { ProfileSettings } from "./settings/profile-settings"
import { ReferralCodeSettings } from "./settings/referral-code-settings"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Settings } from "lucide-react"
import Link from "next/link"

// Define un tipo para el perfil de usuario si no existe
interface UserProfile {
  id: string
  first_name?: string | null
  last_name?: string | null
  account_type?: string | null
  phone?: string | null
  created_at?: string | null
  referral_code?: string | null
  stripe_customer_id?: string | null
  // Añade cualquier otro campo de perfil que uses
}

interface SettingsSectionProps {
  profile: UserProfile | null
  changePassword: (newPassword: string) => Promise<{ error: any | null }>
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<{ error: any | null }>

  // Password state and handlers
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

  // Profile state and handlers
  firstName: string
  setFirstName: (value: string) => void
  lastName: string
  setLastName: (value: string) => void
  profileUpdateMessage: string
  setProfileUpdateMessage: (value: string) => void
  profileUpdateError: string
  setProfileUpdateError: (value: string) => void

  // Referral Code state and handlers
  newReferralCode: string
  setNewReferralCode: (value: string) => void
  referralCodeUpdateMessage: string
  setReferralCodeUpdateMessage: (value: string) => void
  referralCodeUpdateError: string
  setReferralCodeUpdateError: (value: string) => void
}

export function SettingsSection({
  profile,
  changePassword,
  updateUserProfile,
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
  firstName,
  setFirstName,
  lastName,
  setLastName,
  profileUpdateMessage,
  setProfileUpdateMessage,
  profileUpdateError,
  setProfileUpdateError,
  newReferralCode,
  setNewReferralCode,
  referralCodeUpdateMessage,
  setReferralCodeUpdateMessage,
  referralCodeUpdateError,
  setReferralCodeUpdateError,
}: SettingsSectionProps) {
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordChangeMessage("")
    setPasswordChangeError("")

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError("Las nuevas contraseñas no coinciden.")
      return
    }
    if (newPassword.length < 6) {
      setPasswordChangeError("La nueva contraseña debe tener al menos 6 caracteres.")
      return
    }

    const { error } = await changePassword(newPassword)

    if (error) {
      setPasswordChangeError(`Error al cambiar contraseña: ${error.message}`)
    } else {
      setPasswordChangeMessage("Contraseña cambiada exitosamente.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileUpdateMessage("")
    setProfileUpdateError("")

    if (!firstName.trim() || !lastName.trim()) {
      setProfileUpdateError("El nombre y apellido no pueden estar vacíos.")
      return
    }

    const { error } = await updateUserProfile({ first_name: firstName, last_name: lastName })

    if (error) {
      setProfileUpdateError(`Error al actualizar perfil: ${error.message}`)
    } else {
      setProfileUpdateMessage("Información de perfil actualizada exitosamente.")
    }
  }

  const handleReferralCodeUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setReferralCodeUpdateMessage("")
    setReferralCodeUpdateError("")

    if (!newReferralCode.trim()) {
      setReferralCodeUpdateError("El código de referido no puede estar vacío.")
      return
    }
    if (!/^[a-zA-Z0-9]+$/.test(newReferralCode)) {
      setReferralCodeUpdateError("El código de referido solo puede contener letras y números.")
      return
    }

    const { error } = await updateUserProfile({ referral_code: newReferralCode })

    if (error) {
      setReferralCodeUpdateError(`Error al actualizar código de referido: ${error.message}`)
    } else {
      setReferralCodeUpdateMessage("Código de referido actualizado exitosamente.")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Configuración Rápida</CardTitle>
          <Settings className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li>
              <Link href="/dashboard/settings/profile">
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-sm text-muted-foreground hover:text-foreground"
                >
                  Editar Perfil <ArrowRight className="ml-1 h-3 w-3 inline" />
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/settings/password">
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-sm text-muted-foreground hover:text-foreground"
                >
                  Cambiar Contraseña <ArrowRight className="ml-1 h-3 w-3 inline" />
                </Button>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/settings/referral-code">
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-sm text-muted-foreground hover:text-foreground"
                >
                  Gestionar Código de Referido <ArrowRight className="ml-1 h-3 w-3 inline" />
                </Button>
              </Link>
            </li>
          </ul>
        </CardContent>
      </Card>

      <PasswordSettings
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmNewPassword={confirmNewPassword}
        setConfirmNewPassword={setConfirmNewPassword}
        passwordChangeMessage={passwordChangeMessage}
        passwordChangeError={passwordChangeError}
        handlePasswordChange={handlePasswordChange}
      />

      <ProfileSettings
        firstName={firstName}
        setFirstName={setFirstName}
        lastName={lastName}
        setLastName={setLastName}
        profileUpdateMessage={profileUpdateMessage}
        profileUpdateError={profileUpdateError}
        handleProfileUpdate={handleProfileUpdate}
      />

      {profile?.account_type === "client" && (
        <ReferralCodeSettings
          newReferralCode={newReferralCode}
          setNewReferralCode={setNewReferralCode}
          referralCodeUpdateMessage={referralCodeUpdateMessage}
          referralCodeUpdateError={referralCodeUpdateError}
          handleReferralCodeUpdate={handleReferralCodeUpdate}
        />
      )}
    </div>
  )
}
