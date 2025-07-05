"use client"

import { useState } from "react"
import { Suspense } from "react"
import ReferralsSection from "../components/referrals-section"

export default function ReferralsPage() {
  const [copySuccess, setCopySuccess] = useState(false)
  const [referralCode] = useState("FOXLAW2024")

  const referralStats = {
    totalReferrals: 24,
    activeReferrals: 18,
    totalEarnings: 1250,
    monthlyEarnings: 320,
    conversionRate: 75,
    pendingPayouts: 180,
  }

  const referralHistory = [
    {
      id: 1,
      name: "María González",
      email: "maria@email.com",
      status: "Activo",
      joinDate: "2024-01-15",
      earnings: 50,
      plan: "Estándar",
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      email: "carlos@email.com",
      status: "Activo",
      joinDate: "2024-01-10",
      earnings: 75,
      plan: "Premium",
    },
    {
      id: 3,
      name: "Ana Martínez",
      email: "ana@email.com",
      status: "Pendiente",
      joinDate: "2024-01-08",
      earnings: 0,
      plan: "Básico",
    },
    {
      id: 4,
      name: "Luis Fernández",
      email: "luis@email.com",
      status: "Activo",
      joinDate: "2024-01-05",
      earnings: 50,
      plan: "Estándar",
    },
    {
      id: 5,
      name: "Sofia Herrera",
      email: "sofia@email.com",
      status: "Cancelado",
      joinDate: "2023-12-20",
      earnings: 25,
      plan: "Básico",
    },
  ]

  const payoutHistory = [
    {
      id: 1,
      date: "2024-01-01",
      amount: 450,
      status: "Pagado",
      method: "PayPal",
      referrals: 9,
    },
    {
      id: 2,
      date: "2023-12-01",
      amount: 380,
      status: "Pagado",
      method: "Transferencia",
      referrals: 7,
    },
    {
      id: 3,
      date: "2023-11-01",
      amount: 275,
      status: "Pagado",
      method: "PayPal",
      referrals: 5,
    },
    {
      id: 4,
      date: "2023-10-01",
      amount: 145,
      status: "Procesando",
      method: "Transferencia",
      referrals: 3,
    },
  ]

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

  const shareOnSocial = (platform: string) => {
    const referralLink = `https://foxlawyer.vercel.app/register?ref=${referralCode}`
    const message = "¡Únete a Fox Lawyer y obtén asesoría legal profesional!"

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message + " " + referralLink)}`,
    }

    if (urls[platform as keyof typeof urls]) {
      window.open(urls[platform as keyof typeof urls], "_blank")
    }
  }

  return (
    <div className="grid gap-6 p-6 md:p-8">
      <h1 className="text-3xl font-bold">Programa de Referidos</h1>
      <Suspense
        fallback={
          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <div className="h-8 w-48 bg-muted rounded" />
            </div>
            <div className="bg-card p-4 rounded-lg shadow">
              <div className="h-6 w-full bg-muted rounded mb-4" />
              <div className="space-y-2">
                <div className="h-10 w-full bg-muted rounded mb-4" />
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 w-1/3 bg-muted rounded" />
                    <div className="h-4 w-1/4 bg-muted rounded" />
                    <div className="h-4 w-1/6 bg-muted rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      >
        <ReferralsSection />
      </Suspense>
    </div>
  )
}
