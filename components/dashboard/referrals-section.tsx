"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Share2, Copy, CheckCircle, Gift, UserPlus, Users, DollarSign, TrendingUp } from "lucide-react"

interface ReferralsSectionProps {
  referralStats: {
    total_referrals: number
    active_referrals: number
    total_earnings: number
    monthly_earnings: number
  }
  referralCode: string
}

export function ReferralsSection({ referralStats, referralCode }: ReferralsSectionProps) {
  const [copySuccess, setCopySuccess] = useState(false)

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Programa de Referidos</h2>
          <p className="text-muted-foreground">Gana dinero compartiendo Fox Lawyer con tus amigos</p>
        </div>
      </div>

      {/* Referral Link Card */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <Share2 className="w-5 h-5 mr-2 text-emerald-400" />
            Tu Enlace de Referido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="referralLink" className="text-sm font-medium">
              Enlace de Referido
            </Label>
            <div className="flex mt-2">
              <Input
                id="referralLink"
                value={`https://foxlawyer.vercel.app/register?ref=${referralCode}`}
                readOnly
                className="flex-1"
              />
              <Button onClick={copyReferralLink} variant="outline" className="ml-2" disabled={copySuccess}>
                {copySuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Gift className="w-5 h-5 text-emerald-400" />
              <h4 className="font-semibold text-emerald-400">¿Cómo funciona?</h4>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Comparte tu enlace único con amigos y familiares</li>
              <li>• Gana $25 USD por cada persona que se registre usando tu enlace</li>
              <li>• Los pagos se procesan automáticamente cada mes</li>
              <li>• No hay límite en la cantidad de referidos</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Referidos</p>
                <p className="text-2xl font-bold text-foreground">{referralStats.total_referrals}</p>
                <p className="text-sm text-emerald-400">Todos los tiempos</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Referidos Activos</p>
                <p className="text-2xl font-bold text-foreground">{referralStats.active_referrals}</p>
                <p className="text-sm text-blue-400">Usuarios activos</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ganancias Totales</p>
                <p className="text-2xl font-bold text-foreground">${referralStats.total_earnings}</p>
                <p className="text-sm text-purple-400">USD ganados</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Este Mes</p>
                <p className="text-2xl font-bold text-foreground">${referralStats.monthly_earnings}</p>
                <p className="text-sm text-orange-400">Ganancias mensuales</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
