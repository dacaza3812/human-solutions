"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { AdvisorClientsSection } from "../components/advisor-clients-section"
import { ClientCasesSection } from "../components/client-cases-section"
import { ClientsStatsSkeleton, ClientsTableSkeleton } from "../components/clients-skeleton"
import { getAdvisorClientsData, type ClientStats, type ClientData } from "@/actions/advisor-clients"

export default function ClientsPage() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<ClientStats | null>(null)
  const [clients, setClients] = useState<ClientData[]>([])

  useEffect(() => {
    async function loadClientsData() {
      if (!user || !profile) return

      try {
        setLoading(true)
        setError(null)

        if (profile.account_type === "advisor") {
          const data = await getAdvisorClientsData()
          setStats(data.stats)
          setClients(data.clients)
        }
      } catch (err) {
        console.error("Error loading clients data:", err)
        setError("Error al cargar los datos de clientes. Por favor, intenta de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    loadClientsData()
  }, [user, profile])

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando información del usuario...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            {profile.account_type === "advisor"
              ? "Gestiona y supervisa a tus clientes"
              : "Gestiona tus casos y comunicación"}
          </p>
        </div>

        {profile.account_type === "advisor" ? (
          <>
            <ClientsStatsSkeleton />
            <ClientsTableSkeleton />
          </>
        ) : (
          <ClientsTableSkeleton />
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">
          {profile.account_type === "advisor"
            ? "Gestiona y supervisa a tus clientes"
            : "Gestiona tus casos y comunicación"}
        </p>
      </div>

      {profile.account_type === "advisor" ? (
        stats && <AdvisorClientsSection stats={stats} clients={clients} />
      ) : (
        <ClientCasesSection />
      )}
    </div>
  )
}
