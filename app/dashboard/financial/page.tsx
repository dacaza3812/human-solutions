import { createClient } from "@/lib/supabase-server"
import { FinancialOverviewSection } from "@/app/dashboard/components/financial-overview-section"
import { redirect } from "next/navigation"

export default async function FinancialPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    console.error("Error fetching profile:", profileError)
    redirect("/login") // Redirect if profile cannot be fetched
  }

  const isAdvisor = profile.account_type === "advisor"

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-6">
      <FinancialOverviewSection advisorId={isAdvisor ? user.id : undefined} />
    </div>
  )
}
