"use client"

import type React from "react"
import { PasswordSettings } from "./settings/password-settings"
import { ProfileSettings } from "./settings/profile-settings"
import { ReferralCodeSettings } from "./settings/referral-code-settings"

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
  handlePasswordChange: (e: React.FormEvent) => Promise<void>

  // Profile state and handlers
  firstName: string
  setFirstName: (value: string) => void
  lastName: string
  setLastName: (value: string) => void
  profileUpdateMessage: string
  setProfileUpdateMessage: (value: string) => void
  profileUpdateError: string
  setProfileUpdateError: (value: string) => void
  handleProfileUpdate: (e: React.FormEvent) => Promise<void>

  // Referral Code state and handlers
  newReferralCode: string
  setNewReferralCode: (value: string) => void
  referralCodeUpdateMessage: string
  setReferralCodeUpdateMessage: (value: string) => void
  referralCodeUpdateError: string
  setReferralCodeUpdateError: (value: string) => void
  handleReferralCodeUpdate: (e: React.FormEvent) => Promise<void>
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
  handlePasswordChange, // Passed from parent
  handleProfileUpdate, // Passed from parent
  handleReferralCodeUpdate, // Passed from parent
}: SettingsSectionProps) {
  // The handlers are now passed as props from the parent SettingsPage
  // No need to redefine them here.

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Configuración de la Cuenta</h2>
          <p className="text-muted-foreground">Gestiona tu información personal y de seguridad</p>
        </div>
      </div>

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
