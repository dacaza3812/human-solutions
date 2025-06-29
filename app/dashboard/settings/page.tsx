"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { SettingsSection } from "@/app/dashboard/components/settings-section" // Ensure this import is correct

export default function SettingsPage() {
  const { user, profile, loading: authLoading, updateUserProfile, changePassword } = useAuth()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [newReferralCode, setNewReferralCode] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [isProfileUpdating, setIsProfileUpdating] = useState(false)
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false)
  const [isReferralCodeUpdating, setIsReferralCodeUpdating] = useState(false)

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "")
      setLastName(profile.last_name || "")
      setPhone(profile.phone || "")
      setNewReferralCode(profile.referral_code || "")
    }
  }, [profile])

  const handleProfileUpdate = useCallback(async () => {
    console.log("handleProfileUpdate called. updateUserProfile type:", typeof updateUserProfile)
    if (typeof updateUserProfile !== "function") {
      console.error("updateUserProfile is not a function. Cannot update profile.")
      toast({
        title: "Error de Actualización",
        description: "No se pudo actualizar el perfil debido a un problema interno. Inténtalo de nuevo.",
        variant: "destructive",
      })
      return
    }

    setIsProfileUpdating(true)
    try {
      const { error } = await updateUserProfile({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
      })

      if (error) {
        toast({
          title: "Error al Actualizar Perfil",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Perfil Actualizado",
          description: "Tu información de perfil ha sido guardada.",
        })
      }
    } catch (err) {
      console.error("Unexpected error updating profile:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado al actualizar el perfil.",
        variant: "destructive",
      })
    } finally {
      setIsProfileUpdating(false)
    }
  }, [firstName, lastName, phone, updateUserProfile])

  const handlePasswordChange = useCallback(async () => {
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Error de Contraseña",
        description: "Las nuevas contraseñas no coinciden.",
        variant: "destructive",
      })
      return
    }

    setIsPasswordUpdating(true)
    try {
      const { error } = await changePassword(newPassword)

      if (error) {
        toast({
          title: "Error al Cambiar Contraseña",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Contraseña Cambiada",
          description: "Tu contraseña ha sido actualizada exitosamente.",
        })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmNewPassword("")
      }
    } catch (err) {
      console.error("Unexpected error changing password:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado al cambiar la contraseña.",
        variant: "destructive",
      })
    } finally {
      setIsPasswordUpdating(false)
    }
  }, [currentPassword, newPassword, confirmNewPassword, changePassword])

  const handleReferralCodeUpdate = useCallback(async () => {
    console.log("handleReferralCodeUpdate called. updateUserProfile type:", typeof updateUserProfile)
    if (typeof updateUserProfile !== "function") {
      console.error("updateUserProfile is not a function. Cannot update referral code.")
      toast({
        title: "Error de Actualización",
        description: "No se pudo actualizar el código de referido debido a un problema interno. Inténtalo de nuevo.",
        variant: "destructive",
      })
      return
    }

    setIsReferralCodeUpdating(true)
    try {
      const { error } = await updateUserProfile({
        referral_code: newReferralCode,
      })

      if (error) {
        toast({
          title: "Error al Actualizar Código de Referido",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Código de Referido Actualizado",
          description: "Tu código de referido ha sido guardado.",
        })
      }
    } catch (err) {
      console.error("Unexpected error updating referral code:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado al actualizar el código de referido.",
        variant: "destructive",
      })
    } finally {
      setIsReferralCodeUpdating(false)
    }
  }, [newReferralCode, updateUserProfile])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configuración de la Cuenta</h1>

      <SettingsSection
        profile={profile}
        firstName={firstName}
        setFirstName={setFirstName}
        lastName={lastName}
        setLastName={setLastName}
        phone={phone}
        setPhone={setPhone}
        newReferralCode={newReferralCode}
        setNewReferralCode={setNewReferralCode}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmNewPassword={confirmNewPassword}
        setConfirmNewPassword={setConfirmNewPassword}
        handleProfileUpdate={handleProfileUpdate}
        handlePasswordChange={handlePasswordChange}
        handleReferralCodeUpdate={handleReferralCodeUpdate}
        isProfileUpdating={isProfileUpdating}
        isPasswordUpdating={isPasswordUpdating}
        isReferralCodeUpdating={isReferralCodeUpdating}
      />
    </div>
  )
}
