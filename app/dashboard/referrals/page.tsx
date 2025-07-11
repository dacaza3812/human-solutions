"use client"
import { useEffect, useState } from "react"
import { ReferralsSection } from "../components/referrals-section"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"

// Define el tipo si no lo importas de otro lado
type ReferralStats = {
  total_referrals: number
  active_referrals: number
  total_earnings: number
  monthly_earnings: number
}

export default function ReferralPage() {
  const { profile } = useAuth()
  const [copySuccess, setCopySuccess] = useState(false)
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    total_referrals: 0,
    active_referrals: 0,
    total_earnings: 0,
    monthly_earnings: 0,
  })
  const [referralCode, setReferralCode] = useState("")

  const fetchReferralStats = async (code: string) => {
    try {
      const { data, error } = await supabase.rpc("get_referral_stats4", {
        user_referral_code: code,
      })

      if (error) {
        console.error("Error fetching referral stats:", error)
        return
      }

      if (data && data.length > 0) {
        const stats = data[0] as ReferralStats
        setReferralStats({
          total_referrals: stats.total_referrals || 0,
          active_referrals: stats.active_referrals || 0,
          total_earnings: stats.total_earnings || 0,
          monthly_earnings: stats.monthly_earnings || 0,
        })
      }
    } catch (error) {
      console.error("Error fetching referral stats:", error)
    }
  }

  const copyReferralLink = async () => {
    const link = `${process.env.NEXT_PUBLIC_BASE_URL}/register?ref=${referralCode}`
    try {
      await navigator.clipboard.writeText(link)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Error copying to clipboard:", err)
    }
  }

  useEffect(() => {
    if (profile?.referral_code) {
      setReferralCode(profile.referral_code)
      if (profile.account_type === "client") {
        fetchReferralStats(profile.referral_code)
      }
    }
  }, [profile])

  return (
    <div className="p-6">
      <ReferralsSection
        referralStats={referralStats}
        referralCode={referralCode}
        copyReferralLink={copyReferralLink}
        copySuccess={copySuccess}
      />
    </div>
  )
}