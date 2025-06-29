"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { SettingsSection } from "@/app/dashboard/components/settings-section"
import { useAuth } from "@/contexts/auth-context"
import { FileText } from "lucide-react"

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
  const { profile, loading, changePassword, updateUserProfile } = useAuth()

  // State for Password settings
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [passwordChangeMessage, setPasswordChangeMessage] = useState("")
  const [passwordChangeError, setPasswordChangeError] = useState("")

  // State for Profile settings
  const [firstName, setFirstName] = useState(profile?.first_name || "")
  const [lastName, setLastName] = useState(profile?.last_name || "")
  const [profileUpdateMessage, setProfileUpdateMessage] = useState("")
  const [profileUpdateError, setProfileUpdateError] = useState("")

  // State for Referral Code settings
  const [newReferralCode, setNewReferralCode] = useState(profile?.referral_code || "")
  const [referralCodeUpdateMessage, setReferralCodeUpdateMessage] = useState("")
  const [referralCodeUpdateError, setReferralCodeUpdateError] = useState("")

  // Initialize form fields when profile loads or changes
  useEffect(() => {
    console.log("Profile changed in SettingsPage useEffect:", profile)
    if (profile) {
      setFirstName(profile.first_name || "")
      setLastName(profile.last_name || "")
      setNewReferralCode(profile.referral_code || "")
    }
  }, [profile])

  // Handlers for Settings section
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

      console.log("SettingsPage: updateUserProfile type from useAuth:", typeof updateUserProfile)
      // Defensive check: Ensure updateUserProfile is a function before calling
      if (typeof updateUserProfile !== "function") {
        console.error("Error: updateUserProfile is not a function in SettingsPage. It might be undefined or null.")
        setProfileUpdateError("Error interno: La función de actualización de perfil no está disponible.")
        return
      }

      console.log("Attempting to update profile with:", { first_name: firstName, last_name: lastName })
      const { error } = await updateUserProfile({ first_name: firstName, last_name: lastName })

      if (error) {
        setProfileUpdateError(`Error al actualizar perfil: ${error.message}`)
      } else {
        setProfileUpdateMessage("Información de perfil actualizada exitosamente.")
        // The useEffect will pick up the profile change from AuthContext and update local state
      }
    },
    [firstName, lastName, updateUserProfile],
  ) // Add updateUserProfile to dependencies

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

      // Defensive check: Ensure updateUserProfile is a function before calling
      if (typeof updateUserProfile !== "function") {
        console.error(
          "Error: updateUserProfile is not a function in SettingsPage (referral code update). It might be undefined or null.",
        )
        setReferralCodeUpdateError("Error interno: La función de actualización de perfil no está disponible.")
        return
      }

      const { error } = await updateUserProfile({ referral_code: newReferralCode })

      if (error) {
        setReferralCodeUpdateError(`Error al actualizar código de referido: ${error.message}`)
      } else {
        setReferralCodeUpdateMessage("Código de referido actualizado exitosamente.")
        // The useEffect will pick up the profile change from AuthContext and update local state
      }
    },
    [newReferralCode, updateUserProfile],
  ) // Add updateUserProfile to dependencies

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Cargando...</h3>
        <p className="text-muted-foreground">Cargando configuración de la cuenta.</p>
      </div>
    )
  }

  return (
    <SettingsSection
      profile={profile}
      changePassword={changePassword} // This is passed, but the handler is defined in this component
      updateUserProfile={updateUserProfile} // This is passed, but the handler is defined in this component
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
      handlePasswordChange={handlePasswordChange} // Pass the handler
      firstName={firstName}
      setFirstName={setFirstName}
      lastName={lastName}
      setLastName={setLastName}
      profileUpdateMessage={profileUpdateMessage}
      setProfileUpdateMessage={setProfileUpdateMessage}
      profileUpdateError={profileUpdateError}
      setProfileUpdateError={setProfileUpdateError}
      handleProfileUpdate={handleProfileUpdate} // Pass the handler
      newReferralCode={newReferralCode}
      setNewReferralCode={setNewReferralCode}
      referralCodeUpdateMessage={referralCodeUpdateMessage}
      setReferralCodeUpdateMessage={setReferralCodeUpdateMessage}
      referralCodeUpdateError={referralCodeUpdateError}
      setReferralCodeUpdateError={setReferralCodeUpdateError}
      handleReferralCodeUpdate={handleReferralCodeUpdate} // Pass the handler
    />
  )
}
