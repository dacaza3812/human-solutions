"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context-final"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { getReferralStats, getUserReferrals, type ReferralStats, type ReferralRecord } from "@/lib/supabase-updated"
import { Copy, Users, TrendingUp, Share2, Phone, Mail, Calendar } from "lucide-react"

export default function DashboardPage() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth()
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null)
  const [referralList, setReferralList] = useState<ReferralRecord[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState(false)

  // Generar enlace de referido
  const referralLink = profile?.referral_code ? `${window.location.origin}/register?ref=${profile.referral_code}` : ""

  useEffect(() => {
    if (profile?.id) {
      loadReferralData()
    }
  }, [profile?.id])

  const loadReferralData = async () => {
    if (!profile?.id) return

    setStatsLoading(true)
    try {
      console.log("[DASHBOARD] Loading referral data for user:", profile.id)

      // Cargar estadísticas
      const stats = await getReferralStats(profile.id)
      console.log("[DASHBOARD] Referral stats:", stats)
      setReferralStats(stats)

      // Cargar lista de referidos
      const referrals = await getUserReferrals(profile.id)
      console.log("[DASHBOARD] User referrals:", referrals)
      setReferralList(referrals)
    } catch (error) {
      console.error("[DASHBOARD] Error loading referral data:", error)
    } finally {
      setStatsLoading(false)
    }
  }

  const copyReferralLink = async () => {
    if (!referralLink) return

    try {
      await navigator.clipboard.writeText(referralLink)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement("textarea")
      textArea.value = referralLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  const shareOnWhatsApp = () => {
    const message = `¡Únete a nuestra plataforma! Usa mi código de referido: ${profile?.referral_code}\n\n${referralLink}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const shareOnTwitter = () => {
    const message = `¡Únete a nuestra plataforma! Usa mi código de referido: ${profile?.referral_code}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`
    window.open(twitterUrl, "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Requerido</CardTitle>
            <CardDescription>Debes iniciar sesión para acceder al dashboard</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Bienvenido, {profile.first_name} {profile.last_name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={refreshProfile}>
                Actualizar
              </Button>
              <Button variant="outline" onClick={signOut}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información del Usuario */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre Completo</p>
                  <p className="text-lg">
                    {profile.first_name} {profile.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Teléfono</p>
                  <p className="text-lg flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {profile.phone || "No proporcionado"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo de Cuenta</p>
                  <Badge variant={profile.account_type === "advisor" ? "default" : "secondary"}>
                    {profile.account_type === "advisor" ? "Asesor" : "Cliente"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Código de Referido</p>
                  <p className="text-lg font-mono bg-gray-100 px-2 py-1 rounded">{profile.referral_code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Referido por</p>
                  <p className="text-lg">
                    {profile.referred_by ? (
                      <span className="font-mono bg-green-100 px-2 py-1 rounded text-green-800">
                        {profile.referred_by}
                      </span>
                    ) : (
                      <span className="text-gray-500">Registro directo</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas de Referidos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Referidos</p>
                    <p className="text-2xl font-bold text-blue-600">{referralStats?.total_referrals || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Referidos Activos</p>
                    <p className="text-2xl font-bold text-green-600">{referralStats?.active_referrals || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ganancias Totales</p>
                    <p className="text-2xl font-bold text-purple-600">${referralStats?.total_earnings || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Este Mes</p>
                    <p className="text-2xl font-bold text-orange-600">${referralStats?.monthly_earnings || 0}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sistema de Referidos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compartir Referido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Compartir Referido
              </CardTitle>
              <CardDescription>Invita a otros y gana $25 por cada referido exitoso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Tu enlace de referido:</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                  <Button
                    onClick={copyReferralLink}
                    variant="outline"
                    size="sm"
                    className={copySuccess ? "bg-green-50 border-green-200" : ""}
                  >
                    <Copy className="h-4 w-4" />
                    {copySuccess ? "¡Copiado!" : "Copiar"}
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-gray-500 mb-3">Compartir en redes sociales:</p>
                <div className="flex space-x-2">
                  <Button onClick={shareOnWhatsApp} variant="outline" size="sm" className="flex-1">
                    WhatsApp
                  </Button>
                  <Button onClick={shareOnTwitter} variant="outline" size="sm" className="flex-1">
                    Twitter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Referidos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Mis Referidos ({referralList.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {referralList.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aún no tienes referidos</p>
                  <p className="text-sm text-gray-400">¡Comparte tu enlace para comenzar!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {referralList.map((referral) => (
                    <div
                      key={referral.referred_user_id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {referral.referred_first_name} {referral.referred_last_name}
                        </p>
                        <p className="text-sm text-gray-500">{referral.referred_email}</p>
                        {referral.referred_phone && <p className="text-sm text-gray-500">{referral.referred_phone}</p>}
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(referral.referral_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={referral.status === "active" ? "default" : "secondary"}>
                          {referral.status}
                        </Badge>
                        <p className="text-sm font-medium text-green-600 mt-1">${referral.commission_earned}</p>
                        {referral.commission_paid && <p className="text-xs text-green-500">Pagado</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Debug Info (solo en desarrollo) */}
        {process.env.NODE_ENV === "development" && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Debug Info (Solo Desarrollo)</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(
                  {
                    user_id: user.id,
                    profile: profile,
                    referral_stats: referralStats,
                    referral_count: referralList.length,
                  },
                  null,
                  2,
                )}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
