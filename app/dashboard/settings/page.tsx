"use client"
import ProfileSettings from "@/app/dashboard/components/settings/profile-settings"
import PasswordSettings from "@/app/dashboard/components/settings/password-settings"
import ReferralCodeSettings from "@/app/dashboard/components/settings/referral-code-settings"
import { createClient } from "@/lib/supabase-server"

export default async function SettingsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user profile to determine role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single()

  if (profileError) {
    console.error("Error fetching user profile:", profileError)
    return <div>Error loading settings.</div>
  }

  const userRole = profile?.role || "client" // Default to client if role is not found

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Configuración de Cuenta</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileSettings />
        <PasswordSettings />
        {userRole === "advisor" && <ReferralCodeSettings />}
      </div>
    </div>
  )
}
