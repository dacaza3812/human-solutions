"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CopyIcon, CheckIcon, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ReferralStats {
  total_referrals: number
  active_referrals: number
  total_earnings: number
  monthly_earnings: number
}

export function ReferralsSection() {
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    total_referrals: 0,
    active_referrals: 0,
    total_earnings: 0,
    monthly_earnings: 0,
  })
  const [referralCode, setReferralCode] = useState("")
  const [copySuccess, setCopySuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      console.error("Error fetching profile for referral:", profileError)
      toast({
        title: "Error",
        description: "No se pudo cargar el código de referido.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    let userReferralCode = profile.referral_code
    if (!userReferralCode) {
      // Generate a new referral code if it doesn't exist
      const newCode = generateUniqueReferralCode(user.id) // You might want a more robust generation
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ referral_code: newCode })
        .eq("id", user.id)
      if (updateError) {
        console.error("Error updating referral code:", updateError)
        toast({
          title: "Error",
          description: "No se pudo generar el código de referido.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }
      userReferralCode = newCode
    }
    setReferralCode(userReferralCode)

    // Fetch referral stats using the RPC function
    const { data: statsData, error: statsError } = await supabase.rpc("get_referral_stats", {
      user_referral_code: userReferralCode,
    })

    if (statsError) {
      console.error("Error fetching referral stats:", statsError)
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas de referidos.",
        variant: "destructive",
      })
    } else if (statsData && statsData.length > 0) {
      setReferralStats(statsData[0])
    }
    setLoading(false)
  }

  const generateUniqueReferralCode = (userId: string) => {
    // Simple generation, consider a more robust method for production
    return `${userId.substring(0, 8)}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase()
  }

  const copyReferralLink = async () => {
    const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/register?ref=${referralCode}`
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopySuccess(true)
      toast({
        title: "Copiado",
        description: "Enlace de referido copiado al portapapeles.",
        action: <CheckIcon className="text-green-500" />,
      })
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Error copying to clipboard:", err)
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Programa de Referidos</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Cargando datos de referidos...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Programa de Referidos</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{referralStats.total_referrals}</p>
            <p className="text-sm text-muted-foreground">Referidos Totales</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{referralStats.active_referrals}</p>
            <p className="text-sm text-muted-foreground">Referidos Activos</p>
          </div>
          <div>
            <p className="text-2xl font-bold">${referralStats.total_earnings.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Ganancias Totales</p>
          </div>
          <div>
            <p className="text-2xl font-bold">${referralStats.monthly_earnings.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Ganancias Mensuales</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="referral-link">Tu Enlace de Referido</Label>
          <div className="flex space-x-2">
            <Input
              id="referral-link"
              readOnly
              value={`${process.env.NEXT_PUBLIC_BASE_URL}/register?ref=${referralCode}`}
              className="flex-1"
            />
            <Button onClick={copyReferralLink} disabled={copySuccess}>
              {copySuccess ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
              <span className="sr-only">Copiar enlace</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Comparte este enlace para invitar a nuevos usuarios.</p>
        </div>
      </CardContent>
    </Card>
  )
}
