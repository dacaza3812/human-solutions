"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { SettingsSection } from "../components/settings-section"

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

export default function SettingsPage() {
  const { profile, updateUserProfile, changePassword, loading: authLoading } = useAuth()

  // State for Settings section
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [passwordChangeMessage, setPasswordChangeMessage] = useState("")
  const [passwordChangeError, setPasswordChangeError] = useState("")

  const [firstName, setFirstName] = useState(profile?.first_name || "")
  const [lastName, setLastName] = useState(profile?.last_name || "")
  const [profileUpdateMessage, setProfileUpdateMessage] = useState("")
  const [profileUpdateError, setProfileUpdateError] = useState("")

  const [newReferralCode, setNewReferralCode] = useState(profile?.referral_code || "")
  const [referralCodeUpdateMessage, setReferralCodeUpdateMessage] = useState("")
  const [referralCodeUpdateError, setReferralCodeUpdateError] = useState("")

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "")
      setLastName(profile.last_name || "")
      setNewReferralCode(profile.referral_code || "")
    }
  }, [profile])

  const handlePasswordChange = useCallback(
    async (e: React.FormEvent) => {
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

      if (typeof changePassword !== "function") {
        console.error("changePassword is not a function:", changePassword)
        setPasswordChangeError("Error interno: No se pudo cambiar la contraseña. Intente de nuevo más tarde.")
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
    },
    [newPassword, confirmNewPassword, changePassword],
  )

  const handleProfileUpdate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setProfileUpdateMessage("")
      setProfileUpdateError("")

      if (!firstName.trim() || !lastName.trim()) {
        setProfileUpdateError("El nombre y apellido no pueden estar vacíos.")
        return
      }

      if (typeof updateUserProfile !== "function") {
        console.error("updateUserProfile is not a function:", updateUserProfile)
        setProfileUpdateError("Error interno: No se pudo actualizar el perfil. Intente de nuevo más tarde.")
        return
      }

      const { error } = await updateUserProfile({ first_name: firstName, last_name: lastName })

      if (error) {
        setProfileUpdateError(`Error al actualizar perfil: ${error.message}`)
      } else {
        setProfileUpdateMessage("Información de perfil actualizada exitosamente.")
      }
    },
    [firstName, lastName, updateUserProfile],
  )

  const handleReferralCodeUpdate = useCallback(
    async (e: React.FormEvent) => {
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

      if (typeof updateUserProfile !== "function") {
        console.error("updateUserProfile is not a function:", updateUserProfile)
        setReferralCodeUpdateError("Error interno: No se pudo actualizar el código. Intente de nuevo más tarde.")
        return
      }

      const { error } = await updateUserProfile({ referral_code: newReferralCode })

      if (error) {
        setReferralCodeUpdateError(`Error al actualizar código de referido: ${error.message}`)
      } else {
        setReferralCodeUpdateMessage("Código de referido actualizado exitosamente.")
        // The profile context will update, which will then update newReferralCode via useEffect
      }
    },
    [newReferralCode, updateUserProfile],
  )

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <SettingsSection
      currentPassword={currentPassword}
      setCurrentPassword={setCurrentPassword}
      newPassword={newPassword}
      setNewPassword={setNewPassword}
      confirmNewPassword={confirmNewPassword}
      setConfirmNewPassword={setConfirmNewPassword}
      passwordChangeMessage={passwordChangeMessage}
      setPasswordChangeMessage={setPasswordChangeMessage}
      passwordChangeError={passwordChangeError}
      setPasswordChangeError={setPasswordChangeError}
      handlePasswordChange={handlePasswordChange}
      firstName={firstName}
      setFirstName={setFirstName}
      lastName={lastName}
      setLastName={setLastName}
      profileUpdateMessage={profileUpdateMessage}
      setProfileUpdateMessage={setProfileUpdateMessage}
      profileUpdateError={profileUpdateError}
      setProfileUpdateError={setProfileUpdateError}
      handleProfileUpdate={handleProfileUpdate}
      newReferralCode={newReferralCode}
      setNewReferralCode={setNewReferralCode}
      referralCodeUpdateMessage={referralCodeUpdateMessage}
      setReferralCodeUpdateMessage={setReferralCodeUpdateMessage}
      referralCodeUpdateError={referralCodeUpdateError}
      setReferralCodeUpdateError={setReferralCodeUpdateError}
      handleReferralCodeUpdate={handleReferralCodeUpdate}
      profile={profile}
    />
  )
}
