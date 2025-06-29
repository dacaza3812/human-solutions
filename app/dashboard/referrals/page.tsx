"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle, Copy, XCircle } from "lucide-react"

interface ReferralStats {
  total_referrals: number
  active_referrals: number
  total_earnings: number
  monthly_earnings: number
}

export default function ReferralsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [referralCode, setReferralCode] = useState("")
  const [copySuccess, setCopySuccess] = useState(false)
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    total_referrals: 0,
    active_referrals: 0,
    total_earnings: 0,
    monthly_earnings: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!authLoading && profile) {
      const generatedCode = profile.referral_code || generateUniqueReferralCode(profile.id)
      setReferralCode(generatedCode)
      if (!profile.referral_code) {
        // If profile doesn't have a code, save the generated one
        saveReferralCode(generatedCode)
      }
      fetchReferralStats(generatedCode)
    }
  }, [profile, authLoading])

  const generateUniqueReferralCode = (userId: string) => {
    // Simple generation, could be more robust
    return `REF-${userId.substring(0, 8).toUpperCase()}`
  }

  const saveReferralCode = async (code: string) => {
    if (!user) return
    try {
      const { error } = await supabase.from("profiles").update({ referral_code: code }).eq("id", user.id)
      if (error) {
        console.error("Error saving referral code:", error)
        toast({
          title: "Error",
          description: "No se pudo guardar el código de referido.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Unexpected error saving referral code:", err)
    }
  }

  const fetchReferralStats = useCallback(async (code: string) => {
    setLoadingStats(true)
    try {
      const { data, error } = await supabase.rpc("get_referral_stats", {
        user_referral_code: code,
      })

      if (error) {
        console.error("Error fetching referral stats:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las estadísticas de referidos.",
          variant: "destructive",
        })
        setReferralStats({ total_referrals: 0, active_referrals: 0, total_earnings: 0, monthly_earnings: 0 })
      } else if (data && data.length > 0) {
        setReferralStats(data[0])
      } else {
        setReferralStats({ total_referrals: 0, active_referrals: 0, total_earnings: 0, monthly_earnings: 0 })
      }
    } catch (err) {
      console.error("Unexpected error fetching referral stats:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado al cargar las estadísticas.",
        variant: "destructive",
      })
    } finally {
      setLoadingStats(false)
    }
  }, [])

  const copyReferralLink = async () => {
    const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/register?ref=${referralCode}`
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopySuccess(true)
      toast({
        title: "Enlace Copiado",
        description: "El enlace de referido ha sido copiado al portapapeles.",
      })
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Error copying to clipboard:", err)
      toast({
        title: "Error al Copiar",
        description: "No se pudo copiar el enlace. Por favor, inténtalo manualmente.",
        variant: "destructive",
      })
    }
  }

  if (authLoading || loadingStats) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (profile?.account_type !== "client") {
    return (
      <div className="text-center py-12">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-foreground mb-2">Acceso Denegado</h3>
        <p className="text-muted-foreground">Esta sección es solo para clientes.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Programa de Referidos</h1>

      <Card>
        <CardHeader>
          <CardTitle>Tu Código de Referido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Comparte este enlace con tus amigos y gana recompensas cuando se registren y se suscriban.
          </p>
          <div className="flex items-center space-x-2">
            <Input
              readOnly
              value={`${process.env.NEXT_PUBLIC_BASE_URL}/register?ref=${referralCode}`}
              className="flex-1"
            />
            <Button onClick={copyReferralLink}>
              {copySuccess ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="ml-2">{copySuccess ? "Copiado!" : "Copiar Enlace"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tus Estadísticas de Referidos</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
            <p className="text-4xl font-bold text-emerald-500">{referralStats.total_referrals}</p>
            <p className="text-sm text-muted-foreground">Total de Referidos</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
            <p className="text-4xl font-bold text-blue-500">{referralStats.active_referrals}</p>
            <p className="text-sm text-muted-foreground">Referidos Activos</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
            <p className="text-4xl font-bold text-purple-500">${referralStats.total_earnings.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Ganancias Totales</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
            <p className="text-4xl font-bold text-orange-500">${referralStats.monthly_earnings.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Ganancias Este Mes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
