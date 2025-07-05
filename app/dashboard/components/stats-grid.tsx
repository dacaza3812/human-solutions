"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Target, Award, Users, FileText, UserPlus, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2 } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: React.ElementType
  color: string
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div
          className={`mb-3 rounded-full p-3 ${color.replace("text-", "bg-").replace("-500", "-100").replace("-400", "-100")} dark:${color.replace("text-", "bg-").replace("-500", "-800").replace("-400", "-800")}`}
        >
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-3xl font-bold mt-1">{value}</p>
        <p className="text-xs text-muted-foreground mt-2">{change}</p>
      </CardContent>
    </Card>
  )
}

export function StatsGrid({ userRole }: { userRole: string }) {
  const { user, profile } = useAuth()
  const supabase = createClientComponentClient()
  const [referralStats, setReferralStats] = useState({
    total_referrals: 0,
    active_referrals: 0,
    total_earnings: 0,
    monthly_earnings: 0,
  })
  const [userCasesCount, setUserCasesCount] = useState(0)
  const [upcomingAppointmentsCount, setUpcomingAppointmentsCount] = useState(0)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true)
      if (!user) {
        setLoadingStats(false)
        return
      }

      if (userRole === "client") {
        // Fetch client-specific stats
        const { count: casesCount, error: casesError } = await supabase
          .from("cases")
          .select("*", { count: "exact" })
          .eq("client_id", user.id)
          .neq("status", "closed") // Count active cases

        if (casesError) console.error("Error fetching client cases count:", casesError)
        setUserCasesCount(casesCount || 0)

        // Fetch referral stats
        if (profile?.referral_code) {
          const { data: statsData, error: statsError } = await supabase.rpc("get_referral_stats", {
            user_referral_code: profile.referral_code,
          })
          if (statsError) console.error("Error fetching referral stats:", statsError)
          if (statsData && statsData.length > 0) {
            setReferralStats(statsData[0])
          }
        }

        // Fetch upcoming appointments (mock for now, integrate with calendar later)
        // For now, a simple mock count
        setUpcomingAppointmentsCount(2) // Example mock value
      } else if (userRole === "advisor") {
        // Fetch advisor-specific stats
        // Mock data for now
        // In a real app, you'd fetch from DB:
        // - Total active clients
        // - Total resolved cases
        // - Monthly earnings (from subscriptions/payments linked to advisor)
        // - Satisfaction (if you have a rating system)
      }
      setLoadingStats(false)
    }
    fetchStats()
  }, [user, userRole, profile, supabase])

  // Define stats for advisor (mock data for now)
  const advisorStats = [
    {
      title: "Clientes Activos",
      value: "124",
      change: "+12%",
      icon: Users,
      color: "text-emerald-500",
    },
    {
      title: "Casos Resueltos",
      value: "89",
      change: "+8%",
      icon: Target,
      color: "text-blue-500",
    },
    {
      title: "Ingresos Mensuales",
      value: "$12,450",
      change: "+23%",
      icon: DollarSign,
      color: "text-purple-500",
    },
    {
      title: "Satisfacción",
      value: "98%",
      change: "+2%",
      icon: Award,
      color: "text-orange-500",
    },
  ]

  // Define stats for client (dynamic based on fetched data)
  const clientStats = [
    {
      title: "Casos Activos",
      value: userCasesCount.toString(),
      change: "Actualizado",
      icon: FileText,
      color: "text-emerald-500",
    },
    {
      title: "Referidos Totales",
      value: referralStats.total_referrals.toString(),
      change: `+${referralStats.monthly_earnings > 0 ? Math.floor(referralStats.monthly_earnings / 25) : 0}`, // Assuming $25 per referral
      icon: UserPlus,
      color: "text-blue-500",
    },
    {
      title: "Ganancias Totales",
      value: `$${referralStats.total_earnings.toFixed(2)}`,
      change: `+$${referralStats.monthly_earnings.toFixed(2)} este mes`,
      icon: DollarSign,
      color: "text-purple-500",
    },
    {
      title: "Próximas Citas",
      value: upcomingAppointmentsCount.toString(),
      change: "Esta semana",
      icon: Calendar,
      color: "text-orange-500",
    },
  ]

  const displayStats = userRole === "advisor" ? advisorStats : clientStats

  if (loadingStats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex flex-col items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Cargando...</span>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {displayStats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  )
}
