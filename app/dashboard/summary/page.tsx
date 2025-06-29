"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { UserInfoCard } from "@/app/dashboard/components/user-info-card"
import { RecentActivityCard } from "@/app/dashboard/components/recent-activity-card"
import { UpcomingAppointmentsCard } from "@/app/dashboard/components/upcoming-appointments-card"
import { StatsGrid } from "@/app/dashboard/components/stats-grid"
import { ClientCasesSection } from "@/app/dashboard/components/client-cases-section"
import { AdvisorCasesSection } from "@/app/dashboard/components/advisor-cases-section"
import { AdvisorClientsSection } from "@/app/dashboard/components/advisor-clients-section"
import { MessagesSection } from "@/app/dashboard/components/messages-section"
import { QuotesSection } from "@/app/dashboard/components/quotes-section"
import { FinancialOverviewSection } from "@/app/dashboard/components/financial-overview-section"
import { ReferralsSection } from "@/app/dashboard/components/referrals-section"
import { FileText } from "lucide-react"

export default function SummaryPage() {
  const { profile, loading } = useAuth()
  const [activeTab, setActiveTab] = useState("summary") // Default tab

  // Mock data for demonstration
  const mockCases = [
    {
      id: "1",
      title: "Divorcio de mutuo acuerdo",
      status: "En progreso",
      lastUpdate: "2023-10-26",
    },
    {
      id: "2",
      title: "Demanda por accidente de tráfico",
      status: "Pendiente",
      lastUpdate: "2023-10-20",
    },
  ]

  const mockClients = [
    {
      id: "c1",
      name: "Ana García",
      email: "ana.garcia@example.com",
      phone: "555-1234",
      cases: 2,
    },
    {
      id: "c2",
      name: "Luis Fernández",
      email: "luis.f@example.com",
      phone: "555-5678",
      cases: 1,
    },
  ]

  const mockActivity = [
    {
      id: "a1",
      description: "Actualización de caso: Divorcio de mutuo acuerdo",
      timestamp: "Hace 2 horas",
    },
    {
      id: "a2",
      description: "Nuevo mensaje de Ana García",
      timestamp: "Ayer",
    },
  ]

  const mockAppointments = [
    {
      id: "app1",
      title: "Reunión caso Divorcio",
      date: "2023-11-01",
      time: "10:00 AM",
    },
    {
      id: "app2",
      title: "Consulta inicial nuevo cliente",
      date: "2023-11-03",
      time: "02:00 PM",
    },
  ]

  const mockQuotes = [
    {
      id: "q1",
      service: "Asesoría Legal",
      status: "Pendiente",
      amount: "$150",
      date: "2023-10-25",
    },
    {
      id: "q2",
      service: "Representación Judicial",
      status: "Aceptada",
      amount: "$1200",
      date: "2023-10-20",
    },
  ]

  const mockFinancialData = {
    revenue: 15000,
    expenses: 5000,
    profit: 10000,
    pendingPayments: 2500,
  }

  const mockReferralData = {
    totalReferrals: 10,
    activeReferrals: 5,
    earnings: 250,
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Cargando...</h3>
        <p className="text-muted-foreground">Cargando resumen del dashboard.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bienvenido, {profile?.first_name || "Usuario"}!</h1>
          <p className="text-muted-foreground">Aquí tienes un resumen de tu actividad.</p>
        </div>
      </div>

      <StatsGrid profileType={profile?.account_type || "client"} />

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <UserInfoCard profile={profile} />
        <RecentActivityCard activity={mockActivity} />
        <UpcomingAppointmentsCard appointments={mockAppointments} />
      </div>

      {profile?.account_type === "client" && (
        <>
          <ClientCasesSection cases={mockCases} />
          <QuotesSection quotes={mockQuotes} />
          <MessagesSection />
          <ReferralsSection referralData={mockReferralData} />
        </>
      )}

      {profile?.account_type === "advisor" && (
        <>
          <AdvisorCasesSection cases={mockCases} />
          <AdvisorClientsSection clients={mockClients} />
          <MessagesSection />
          <FinancialOverviewSection financialData={mockFinancialData} />
        </>
      )}
    </div>
  )
}
