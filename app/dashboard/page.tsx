"use client"
import { createClient } from "@/lib/supabase-server"
import UserInfoCard from "@/app/dashboard/components/user-info-card"
import StatsGrid from "@/app/dashboard/components/stats-grid"
import FinancialOverviewSection from "@/app/dashboard/components/financial-overview-section"
import AdvisorCasesSection from "@/app/dashboard/components/advisor-cases-section"
import AdvisorClientsSection from "@/app/dashboard/components/advisor-clients-section"
import RecentActivityCard from "@/app/dashboard/components/recent-activity-card"
import UpcomingAppointmentsCard from "@/app/dashboard/components/upcoming-appointments-card"
import MessagesSection from "@/app/dashboard/components/messages-section"
import QuotesSection from "@/app/dashboard/components/quotes-section"
import ReferralsSection from "@/app/dashboard/components/referrals-section"
import SettingsSection from "@/app/dashboard/components/settings-section"
import InquiriesSection from "@/app/dashboard/components/inquiries-section"

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
}

// Define tipos para los datos mock
interface ClientCase {
  id: number
  title: string
  type: string
  status: string
  advisor: string
  advisorAvatar: string
  description: string
  createdDate: string
  nextAppointment: string | null
  progress: number
}

interface AdvisorClient {
  id: number
  name: string
  email: string
  phone: string
  avatar: string
  totalCases: number
  activeCases: number
  completedCases: number
  joinDate: string
  lastActivity: string
}

interface AdvisorCase {
  id: number
  clientName: string
  clientId: number
  title: string
  type: string
  status: string
  priority: string
  createdDate: string
  dueDate: string
  description: string
  progress: number
}

export default async function DashboardPage() {
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
    // Handle error, maybe show a message or redirect
    return <div>Error loading dashboard.</div>
  }

  const userRole = profile?.role || "client" // Default to client if role is not found

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <StatsGrid />

      <div className="grid gap-6 lg:grid-cols-3">
        <UserInfoCard />
        <FinancialOverviewSection />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {userRole === "advisor" && <AdvisorCasesSection />}
        {userRole === "client" && <AdvisorCasesSection />} {/* Re-using for client's cases for now */}
        {userRole === "advisor" && <AdvisorClientsSection />}
        <RecentActivityCard />
        <UpcomingAppointmentsCard />
        <MessagesSection />
        {userRole === "advisor" && <InquiriesSection />}
        {userRole === "advisor" && <QuotesSection />}
        {userRole === "advisor" && <ReferralsSection />}
        <SettingsSection />
      </div>
    </div>
  )
}
