"use client"


import { useState } from "react";
import { SettingsSection } from "../components/settings-section";
import { useAuth } from "@/contexts/auth-context";

export default  function SettingsPage() {
    const { user, profile, signOut, updateUserProfile, changePassword } = useAuth()
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
    const [referralCode, setReferralCode] = useState("")

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
        // Add more robust password strength validation here if needed (e.g., regex for special chars, numbers)

        // Supabase's updateUser does not require current password for security,
        // but it's good practice to include it for user experience and to prevent accidental changes.
        // For simplicity, we're not validating currentPassword against Supabase here.
        // A more secure approach would involve re-authenticating the user or using a server-side function.

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
        // Basic validation: only alphanumeric characters
        if (!/^[a-zA-Z0-9]+$/.test(newReferralCode)) {
            setReferralCodeUpdateError("El código de referido solo puede contener letras y números.")
            return
        }

        // In a real scenario, you'd check for uniqueness on the server-side (e.g., via a Supabase function/trigger)
        // For this mock, we'll just assume it's unique.

        const { error } = await updateUserProfile({ referral_code: newReferralCode })

        if (error) {
            setReferralCodeUpdateError(`Error al actualizar código de referido: ${error.message}`)
        } else {
            setReferralCodeUpdateMessage("Código de referido actualizado exitosamente.")
            setReferralCode(newReferralCode) // Update the local state used for referral link
        }
    }

    return (
        <div className="p-6">
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
        </div>
    )
}