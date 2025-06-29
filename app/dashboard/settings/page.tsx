"use client"

import { useState, useEffect } from "react"
import { SettingsSection } from "../components/settings-section"
import { useAuth } from "@/contexts/auth-context"

export default function SettingsPage() {
  const { profile, updateUserProfile, changePassword } = useAuth()

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

  return (
    <SettingsSection
      profile={profile}
      changePassword={changePassword}
      updateUserProfile={updateUserProfile}
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
      firstName={firstName}
      setFirstName={setFirstName}
      lastName={lastName}
      setLastName={setLastName}
      profileUpdateMessage={profileUpdateMessage}
      setProfileUpdateMessage={setProfileUpdateMessage}
      profileUpdateError={profileUpdateError}
      setProfileUpdateError={setProfileUpdateError}
      newReferralCode={newReferralCode}
      setNewReferralCode={setNewReferralCode}
      referralCodeUpdateMessage={referralCodeUpdateMessage}
      setReferralCodeUpdateMessage={setReferralCodeUpdateMessage}
      referralCodeUpdateError={referralCodeUpdateError}
      setReferralCodeUpdateError={setReferralCodeUpdateError}
    />
  )
}
