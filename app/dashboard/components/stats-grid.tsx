import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, Briefcase, MessageSquare } from "lucide-react"
import { createClient } from "@/lib/supabase-server"

export default async function StatsGrid() {
  const supabase = createClient()
  // In a real app, these would be dynamic fetches based on user role/data
  const { data: totalRevenueData } = await supabase.from("transactions").select("amount").limit(100) // Example
  const { data: totalClientsData } = await supabase.from("profiles").select("id").limit(100) // Example
  const { data: activeCasesData } = await supabase.from("cases").select("id").eq("status", "active").limit(100) // Example
  const { data: pendingInquiriesData } = await supabase
    .from("inquiries")
    .select("id")
    .eq("status", "pending")
    .limit(100) // Example

  const totalRevenue = totalRevenueData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0
  const totalClients = totalClientsData?.length || 0
  const activeCases = activeCasesData?.length || 0
  const pendingInquiries = pendingInquiriesData?.length || 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">+20.1% desde el mes pasado</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{totalClients}</div>
          <p className="text-xs text-muted-foreground">+180.1% desde el mes pasado</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Casos Activos</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{activeCases}</div>
          <p className="text-xs text-muted-foreground">+19% desde el mes pasado</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Consultas Pendientes</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{pendingInquiries}</div>
          <p className="text-xs text-muted-foreground">+201 desde el mes pasado</p>
        </CardContent>
      </Card>
    </div>
  )
}
