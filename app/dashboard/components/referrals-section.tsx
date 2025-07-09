"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Share2,
  Gift,
  UserPlus,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Copy,
} from "lucide-react"

// Define el tipo si no lo importas de otro lado
type ReferralStats = {
  total_referrals: number
  active_referrals: number
  total_earnings: number
  monthly_earnings: number
}

interface ReferralsSectionProps {
  referralStats: ReferralStats
  referralCode: string
  copySuccess: boolean
  copyReferralLink: () => Promise<void>
}

export function ReferralsSection({
  referralStats,
  referralCode,
  copyReferralLink,
  copySuccess,
}: ReferralsSectionProps) {
  const stats = referralStats

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
              <Button onClick={copyReferralLink} variant="outline" className="ml-2 bg-transparent" disabled={copySuccess}>
                {copySuccess ? (
                  <><CheckCircle className="w-4 h-4 mr-2" />Copiado</>
                ) : (
                  <><Copy className="w-4 h-4 mr-2" />Copiar</>
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
              <li>• Gana $50 USD por cada persona que se registre usando tu enlace</li>
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
                <p className="text-2xl font-bold text-foreground">{stats.total_referrals}</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.active_referrals}</p>
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
                <p className="text-2xl font-bold text-foreground">${stats.total_earnings}</p>
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
                <p className="text-2xl font-bold text-foreground">${stats.monthly_earnings}</p>
                <p className="text-sm text-orange-400">Ganancias mensuales</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Share Options */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-foreground">Compartir en Redes Sociales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-12 bg-transparent"
              onClick={() => {
                const text = `¡Únete a Fox Lawyer y transforma tus problemas en oportunidades! Usa mi enlace de referido: https://foxlawyer.vercel.app/register?ref=${referralCode}`
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
              }}
            >
              WhatsApp
            </Button>
            <Button
              variant="outline"
              className="h-12 bg-transparent"
              onClick={() => {
                const text = `¡Únete a Fox Lawyer! https://foxlawyer.vercel.app/register?ref=${referralCode}`
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank")
              }}
            >
              Twitter
            </Button>
            <Button
              variant="outline"
              className="h-12 bg-transparent"
              onClick={() => {
                const text = `¡Únete a Fox Lawyer! https://foxlawyer.vercel.app/register?ref=${referralCode}`
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(text)}`, "_blank")
              }}
            >
              Facebook
            </Button>
            <Button
              variant="outline"
              className="h-12 bg-transparent"
              onClick={() => {
                const subject = "Únete a Fox Lawyer"
                const body = `¡Hola! Te invito a unirte a Fox Lawyer, una plataforma increíble de asesoría personalizada. Usa mi enlace de referido: https://foxlawyer.vercel.app/register?ref=${referralCode}`
                window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
              }}
            >
              Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}