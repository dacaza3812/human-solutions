"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CheckCircle, Copy, UserPlus } from "lucide-react"

interface ReferralStats {
  total_referrals: number
  active_referrals: number
  total_earnings: number
  monthly_earnings: number
}

interface ReferralsSectionProps {
  referralStats: ReferralStats
  referralCode: string
  copyReferralLink: () => Promise<void>
  copySuccess: boolean
}

export function ReferralsSection({
  referralStats,
  referralCode,
  copyReferralLink,
  copySuccess,
}: ReferralsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Programa de Referidos</h2>
          <p className="text-muted-foreground">Invita a tus amigos y gana recompensas.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Tu Código de Referido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input value={referralCode} readOnly className="flex-1" />
              <Button onClick={copyReferralLink} className="bg-emerald-500 hover:bg-emerald-600">
                {copySuccess ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="sr-only">{copySuccess ? "Copiado" : "Copiar"}</span>
              </Button>
            </div>
            {copySuccess && <p className="text-sm text-green-500">¡Enlace copiado al portapapeles!</p>}
            <p className="text-sm text-muted-foreground">
              Comparte este código con tus amigos para que lo usen al registrarse.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Estadísticas de Referidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-foreground">Total de Referidos</span>
              </div>
              <span className="text-2xl font-bold text-foreground">{referralStats.total_referrals}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-green-500" />
                <span className="font-medium text-foreground">Referidos Activos</span>
              </div>
              <span className="text-2xl font-bold text-foreground">{referralStats.active_referrals}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-purple-500" />
                <span className="font-medium text-foreground">Ganancias Totales</span>
              </div>
              <span className="text-2xl font-bold text-foreground">${referralStats.total_earnings.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-orange-500" />
                <span className="font-medium text-foreground">Ganancias Este Mes</span>
              </div>
              <span className="text-2xl font-bold text-foreground">${referralStats.monthly_earnings.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
