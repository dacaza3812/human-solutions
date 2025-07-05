"use client"
import { PasswordSettings } from "./settings/password-settings"
import { ProfileSettings } from "./settings/profile-settings"
import { ReferralCodeSettings } from "./settings/referral-code-settings"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase-server"

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

export default async function SettingsSection() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <p>Por favor, inicia sesión para ver la configuración.</p>
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const isAdvisor = profile?.role === "advisor"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de la Cuenta</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="password">Contraseña</TabsTrigger>
            {isAdvisor && <TabsTrigger value="referral">Referidos</TabsTrigger>}
          </TabsList>
          <TabsContent value="profile" className="mt-4">
            <ProfileSettings />
          </TabsContent>
          <TabsContent value="password" className="mt-4">
            <PasswordSettings />
          </TabsContent>
          {isAdvisor && (
            <TabsContent value="referral" className="mt-4">
              <ReferralCodeSettings />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
