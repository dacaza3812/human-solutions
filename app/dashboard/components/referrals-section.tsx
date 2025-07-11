"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, DollarSign, Users, TrendingUp } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

interface ReferralStats {
  total_referrals: number
  active_referrals: number
  total_earnings: number
  monthly_earnings: number
}

interface ReferredUser {
  id: string
  first_name: string | null
  last_name: string | null
  created_at: string
  payments: Array<{ amount: number; status: string }>
}

interface ReferralTransaction {
  id: string
  amount: number
  created_at: string
  referee_id: string
  profiles: { first_name: string | null; last_name: string | null } | null
}

export function ReferralsSection() {
  const { user, profile } = useAuth()
  const [referralCode, setReferralCode] = useState("")
  const [copySuccess, setCopySuccess] = useState(false)
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    total_referrals: 0,
    active_referrals: 0,
    total_earnings: 0,
    monthly_earnings: 0,
  })
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([])
  const [referralTransactions, setReferralTransactions] = useState<ReferralTransaction[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingReferredUsers, setLoadingReferredUsers] = useState(true)
  const [loadingTransactions, setLoadingTransactions] = useState(true)

  useEffect(() => {
    if (profile?.referral_code) {
      setReferralCode(profile.referral_code)
      fetchReferralStats(profile.referral_code)
      fetchReferredUsers(profile.referral_code)
      fetchReferralTransactions()
    } else if (user) {
      // If no referral code exists, generate one (this logic might be better in auth-context or a server action)
      const generateAndSetReferralCode = async () => {
        const firstName = profile?.first_name?.toLowerCase() || ""
        const lastName = profile?.last_name?.toLowerCase() || ""
        const randomNum = Math.floor(Math.random() * 10000)
        const newCode = `${firstName}${lastName}${randomNum}`.replace(/[^a-z0-9]/g, "") // Sanitize
        setReferralCode(newCode)
        // Update profile in DB
        await supabase.from("profiles").update({ referral_code: newCode }).eq("id", user.id)
        fetchReferralStats(newCode)
      }
      generateAndSetReferralCode()
    }
  }, [profile, user])

  const fetchReferralStats = async (code: string) => {
    setLoadingStats(true)
    try {
      const { data, error } = await supabase.rpc("get_referral_stats4", {
        user_referral_code: code,
      })

      if (error) {
        console.error("Error fetching referral stats:", error)
        setReferralStats({ total_referrals: 0, active_referrals: 0, total_earnings: 0, monthly_earnings: 0 })
        return
      }

      if (data && data.length > 0) {
        const stats = data[0]
        setReferralStats({
          total_referrals: stats.total_referrals || 0,
          active_referrals: stats.active_referrals || 0,
          total_earnings: stats.total_earnings || 0,
          monthly_earnings: stats.monthly_earnings || 0,
        })
      }
    } catch (error) {
      console.error("Error fetching referral stats:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchReferredUsers = async (code: string) => {
    setLoadingReferredUsers(true)
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, created_at, payments(amount, status)")
        .eq("referred_by", code)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching referred users:", error)
        setReferredUsers([])
        return
      }
      setReferredUsers(data as ReferredUser[])
    } catch (error) {
      console.error("Error fetching referred users:", error)
    } finally {
      setLoadingReferredUsers(false)
    }
  }

  const fetchReferralTransactions = async () => {
    setLoadingTransactions(true)
    try {
      if (!user?.id) return

      const { data, error } = await supabase
        .from("referral_transactions")
        .select("id, amount, created_at, referee_id, profiles!referee_id(first_name, last_name)")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching referral transactions:", error)
        setReferralTransactions([])
        return
      }
      setReferralTransactions(data as ReferralTransaction[])
    } catch (error) {
      console.error("Error fetching referral transactions:", error)
    } finally {
      setLoadingTransactions(false)
    }
  }

  const copyReferralLink = async () => {
    const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/register?ref=${referralCode}`
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Error copying to clipboard:", err)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-foreground mb-6">Programa de Referidos</h2>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Tu Código de Referido</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-4">
          <Input readOnly value={referralCode} className="flex-1" />
          <Button onClick={copyReferralLink}>
            <Copy className="w-4 h-4 mr-2" />
            {copySuccess ? "¡Copiado!" : "Copiar Enlace"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referidos Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">{referralStats.total_referrals}</div>
            )}
            <p className="text-xs text-muted-foreground">Usuarios registrados con tu código</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referidos Activos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">{referralStats.active_referrals}</div>
            )}
            <p className="text-xs text-muted-foreground">Referidos que han realizado un pago</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancias Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">${referralStats.total_earnings.toFixed(2)}</div>
            )}
            <p className="text-xs text-muted-foreground">Comisiones acumuladas</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancias del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">${referralStats.monthly_earnings.toFixed(2)}</div>
            )}
            <p className="text-xs text-muted-foreground">Comisiones este mes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Usuarios Referidos</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingReferredUsers ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : referredUsers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Aún no tienes referidos.</p>
            ) : (
              <div className="space-y-3">
                {referredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/40"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Registrado: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.payments && user.payments.some((p) => p.status === "succeeded")
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-orange-500/20 text-orange-400"
                      }`}
                    >
                      {user.payments && user.payments.some((p) => p.status === "succeeded") ? "Activo" : "Pendiente"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Transacciones de Referidos</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTransactions ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : referralTransactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No hay transacciones de referidos.</p>
            ) : (
              <div className="space-y-3">
                {referralTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/40"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        Comisión de {transaction.profiles?.first_name} {transaction.profiles?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Fecha: {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-bold text-emerald-400">${transaction.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
