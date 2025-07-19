"use server"

import { createClient } from "@/lib/supabase-server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export interface ClientStats {
  totalClients: number
  activeClients: number
  monthlyClients: number
  retentionRate: number
  currentMonth: string
}

export interface ClientData {
  id: string
  name: string
  email: string
  phone: string | null
  avatar: string | null
  subscriptionStatus: string
  subscriptionPlan: string | null
  joinDate: string
  lastActivity: string
  totalCases: number
  activeCases: number
  completedCases: number
}

export async function getAdvisorClientsData(): Promise<{
  stats: ClientStats
  clients: ClientData[]
}> {
  try {
    const cookieStore = cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { cookies: {
            get: name => cookieStore.get(name)?.value,
            set: (name, value, opts) => cookieStore.set(name, value, opts),
            remove: name => cookieStore.delete(name),
          }
        }
      )

    // Obtener estadísticas de clientes
    const currentDate = new Date()
    const currentMonth = currentDate.toLocaleString("es-ES", { month: "long" })
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

    // Total de clientes (todos los usuarios registrados)
    const { count: totalClients } = await supabase.from("profiles").select("*", { count: "exact", head: true })

    // Clientes activos (con suscripción activa)
    const { count: activeClients } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("subscription_status", "active")

    // Clientes del mes actual
    const { count: monthlyClients } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", firstDayOfMonth.toISOString())

    // Calcular tasa de retención (usuarios con plan vs total de usuarios)
    const { data: successfulPayments, error: paymentsError } = await supabase
  .from("payments")
  .select("user_id")
  .eq("status", "succeeded")

if (paymentsError) {
  console.error("Error fetching payments:", paymentsError)
  throw paymentsError
}

// Usa un Set para obtener IDs únicos
const uniqueUserIds = new Set(successfulPayments?.map(p => p.user_id))
const usersWithPlan = uniqueUserIds.size

    const total = totalClients || 0
const withPlan = usersWithPlan || 0

const retentionRate = total > 0
  ? Number(((withPlan / total) * 100).toFixed(1))
  : 0

    // Obtener datos detallados de clientes con suscripción activa
    const { data: clientsData, error: clientsError } = await supabase
      .from("profiles")
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        subscription_status,
        plan_id,
        created_at,
        updated_at,
        plans!inner(name)
      `)
      .eq("subscription_status", "active")
      .order("created_at", { ascending: false })

    if (clientsError) {
      console.error("Error fetching clients:", clientsError)
      throw clientsError
    }

    // Para cada cliente, obtener estadísticas de casos
    const clientsWithCases = await Promise.all(
      (clientsData || []).map(async (client) => {
        // Total de casos del cliente
        const { count: totalCases } = await supabase
          .from("cases")
          .select("*", { count: "exact", head: true })
          .eq("user_id", client.id)

        // Casos activos (pendiente y en ejecución)
        const { count: activeCases } = await supabase
          .from("cases")
          .select("*", { count: "exact", head: true })
          .eq("user_id", client.id)
          .in("status", ["pendiente", "en ejecución"])

        // Casos completados
        const { count: completedCases } = await supabase
          .from("cases")
          .select("*", { count: "exact", head: true })
          .eq("user_id", client.id)
          .eq("status", "completado")

        const fullName = [client.first_name, client.last_name].filter(Boolean).join(" ") || "Sin nombre"

        return {
          id: client.id,
          name: fullName,
          email: client.email || "",
          phone: client.phone,
          avatar: "/placeholder-user.jpg", // Usar placeholder ya que no hay avatar_url
          subscriptionStatus: client.subscription_status || "inactive",
          subscriptionPlan: client.plans?.name || null,
          joinDate: client.created_at,
          lastActivity: client.updated_at,
          totalCases: totalCases || 0,
          activeCases: activeCases || 0,
          completedCases: completedCases || 0,
        }
      }),
    )

    const stats: ClientStats = {
      totalClients: totalClients || 0,
      activeClients: activeClients || 0,
      monthlyClients: monthlyClients || 0,
      retentionRate,
      currentMonth: currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1),
    }

    console.log(stats)

    return {
      stats,
      clients: clientsWithCases,
    }
  } catch (error) {
    console.error("Error in getAdvisorClientsData:", error)
    throw new Error("Error al obtener datos de clientes")
  }
}
