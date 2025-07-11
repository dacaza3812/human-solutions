import { createServerSupabaseClient } from "@/lib/supabase-server"
import { FinancialOverviewSection } from "../components/financial-overview-section"

export default async function FinancialPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Handle case where user is not logged in, perhaps redirect to login
    return <div>Por favor, inicia sesión para ver esta página.</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-6">
        <FinancialOverviewSection advisorId={user.id} />
      </main>
    </div>
  )
}
