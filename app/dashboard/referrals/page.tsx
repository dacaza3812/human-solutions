"use client"
import { useEffect, useState } from "react";
import { ReferralsSection } from "../components/referrals-section";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";

export default function referalPage() {
    const { user, profile, signOut, updateUserProfile, changePassword } = useAuth()
    const [copySuccess, setCopySuccess] = useState(false)
    const [referralStats, setReferralStats] = useState({
        total_referrals: 0,
        active_referrals: 0,
        total_earnings: 0,
        monthly_earnings: 0,
    })
    const [referralCode, setReferralCode] = useState("")
    const [newReferralCode, setNewReferralCode] = useState(profile?.referral_code || "")

    const fetchReferralStats = async () => {
        try {
            // Use the new SQL function to get referral stats
            const { data, error } = await supabase.rpc("get_referral_stats4", {
                user_referral_code: referralCode,
            })

            

            if (error) {
                console.error("Error fetching referral stats:", error)
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
        }
    }

    const copyReferralLink = async () => {
        const referralLink = `https://foxlawyer.vercel.app/register?ref=${referralCode}`
        try {
            await navigator.clipboard.writeText(referralLink)
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 2000)
        } catch (err) {
            console.error("Error copying to clipboard:", err)
        }
    }

    useEffect(() => {
        if (profile) {

            setNewReferralCode(profile.referral_code || "")
        }

        if (profile?.referral_code) {
            setReferralCode(profile.referral_code)
        }

        if (profile?.account_type === "client" && profile.id) {
            fetchReferralStats()
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