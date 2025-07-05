"use client"

import type React from "react"
import { Suspense } from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import SettingsSection from "../components/settings-section"
import SettingsLoading from "./loading" // Assuming you'll create a loading component for settings

export default function SettingsPage() {
  const { profile, updateUserProfile, changePassword } = useAuth()

  // Profile settings state
  const [firstName, setFirstName] = useState(profile?.first_name || "")
  const [lastName, setLastName] = useState(profile?.last_name || "")
  const [email, setEmail] = useState(profile?.email || "")
  const [phone, setPhone] = useState(profile?.phone || "")
  const [bio, setBio] = useState("")
  const [profileUpdateMessage, setProfileUpdateMessage] = useState("")
  const [profileUpdateError, setProfileUpdateError] = useState("")

  // Password settings state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [passwordChangeMessage, setPasswordChangeMessage] = useState("")
  const [passwordChangeError, setPasswordChangeError] = useState("")

  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [marketingEmails, setMarketingEmails] = useState(false)

  // Privacy settings state
  const [profileVisibility, setProfileVisibility] = useState("public")
  const [dataSharing, setDataSharing] = useState(false)
  const [analyticsTracking, setAnalyticsTracking] = useState(true)

  // Preferences state
  const [language, setLanguage] = useState("es")
  const [timezone, setTimezone] = useState("America/Mexico_City")
  const [theme, setTheme] = useState("system")

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "")
      setLastName(profile.last_name || "")
      setEmail(profile.email || "")
      setPhone(profile.phone || "")
    }
  }, [profile])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileUpdateMessage("")
    setProfileUpdateError("")

    if (!firstName.trim() || !lastName.trim()) {
      setProfileUpdateError("El nombre y apellido no pueden estar vacíos.")
      return
    }

    const { error } = await updateUserProfile({
      first_name: firstName,
      last_name: lastName,
      phone: phone,
    })

    if (error) {
      setProfileUpdateError(`Error al actualizar perfil: ${error.message}`)
    } else {
      setProfileUpdateMessage("Información de perfil actualizada exitosamente.")
      setTimeout(() => setProfileUpdateMessage(""), 3000)
    }
  }

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
      setTimeout(() => setPasswordChangeMessage(""), 3000)
    }
  }

  return (
    <div className="grid gap-6 p-6 md:p-8">
      <h1 className="text-3xl font-bold">Configuración</h1>
      <Suspense fallback={<SettingsLoading />}>
        <SettingsSection />
      </Suspense>
    </div>
  )
}
