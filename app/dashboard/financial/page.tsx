"use client"

import { useState } from "react"
import { FinancialOverviewSection } from "../components/financial-overview-section"
import { useAuth } from "@/contexts/auth-context"
import { FileText } from "lucide-react"

export default function FinancialPage() {
  const { profile } = useAuth()
  const [dateRange, setDateRange] = useState({
    start: "2024-01-01",
    end: "2024-12-31",
  })

  if (profile?.account_type !== "advisor") {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Acceso Restringido</h3>
        <p className="text-muted-foreground">Esta sección está disponible solo para asesores.</p>
      </div>
    )
  }

  return <FinancialOverviewSection dateRange={dateRange} setDateRange={setDateRange} />
}
