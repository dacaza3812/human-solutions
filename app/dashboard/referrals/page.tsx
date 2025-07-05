"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase-server"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  UserPlus,
  Copy,
  DollarSign,
  Users,
  TrendingUp,
  Share2,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Check,
  Gift,
  Target,
  Calendar,
} from "lucide-react"

export default function ReferralsPage() {
  const [copySuccess, setCopySuccess] = useState(false)
  const [referralCode] = useState("FOXLAW2024")
  const supabase = createClient()
  const [referrals, setReferrals] = useState([])
  const [error, setError] = useState(null)

  const fetchReferrals = async () => {
    const { data, error } = await supabase.from("referrals").select("*").order("created_at", { ascending: false })
    if (error) {
      console.error("Error fetching referrals:", error)
      setError(error)
    } else {
      setReferrals(data)
    }
  }

  useState(() => {
    fetchReferrals()
  }, [])

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
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Programa de Referidos</h1>
          <p className="text-muted-foreground mt-1">Gana dinero invitando a nuevos usuarios</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Gift className="w-4 h-4 mr-2" />
            Ver Recompensas
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            <Share2 className="w-4 h-4 mr-2" />
            Compartir Enlace
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Referidos Totales</CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{referralStats.totalReferrals}</div>
              <p className="text-xs text-muted-foreground mt-1">+3 este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Referidos Activos</CardTitle>
              <UserPlus className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{referralStats.activeReferrals}</div>
              <p className="text-xs text-muted-foreground mt-1">{referralStats.conversionRate}% tasa de conversión</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ganancias Totales</CardTitle>
              <DollarSign className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${referralStats.totalEarnings}</div>
              <p className="text-xs text-muted-foreground mt-1">+${referralStats.monthlyEarnings} este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pagos Pendientes</CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${referralStats.pendingPayouts}</div>
              <p className="text-xs text-muted-foreground mt-1">Próximo pago: 1 Feb</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Share2 className="w-5 h-5 mr-2" />
              Tu Enlace de Referido
            </CardTitle>
            <CardDescription>
              Comparte este enlace para ganar $25 por cada usuario que se registre y se suscriba
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  value={`https://foxlawyer.vercel.app/register?ref=${referralCode}`}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={copyReferralLink} variant="outline">
                  {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copySuccess ? "¡Copiado!" : "Copiar"}
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Código de referido:</span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {referralCode}
                </Badge>
              </div>

              {/* Social Sharing */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Compartir en redes sociales:</p>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareOnSocial("facebook")}
                    className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  >
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareOnSocial("twitter")}
                    className="bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareOnSocial("linkedin")}
                    className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareOnSocial("whatsapp")}
                    className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="referrals" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="referrals">Mis Referidos</TabsTrigger>
            <TabsTrigger value="payouts">Historial de Pagos</TabsTrigger>
            <TabsTrigger value="program">Programa</TabsTrigger>
          </TabsList>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Referidos</CardTitle>
                <CardDescription>Todos los usuarios que se han registrado usando tu enlace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {error ? (
                    <p className="text-center text-muted-foreground">Error loading referrals.</p>
                  ) : referrals.length === 0 ? (
                    <p className="text-center text-muted-foreground">No hay referidos registrados.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email Referido</TableHead>
                          <TableHead>Fecha de Registro</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Comisión</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {referrals.map((referral) => (
                          <TableRow key={referral.id}>
                            <TableCell>{referral.referred_email}</TableCell>
                            <TableCell>
                              {format(new Date(referral.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  referral.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                    : referral.status === "converted"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                }`}
                              >
                                {referral.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              ${referral.commission_amount?.toLocaleString() || "0.00"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Pagos</CardTitle>
                <CardDescription>Todos tus pagos de comisiones por referidos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payoutHistory.map((payout) => (
                    <div
                      key={payout.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">${payout.amount}</p>
                          <p className="text-sm text-muted-foreground">{payout.referrals} referidos</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{payout.method}</p>
                          <p className="text-sm text-muted-foreground">{payout.date}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            payout.status === "Pagado"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }
                        >
                          {payout.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Program Tab */}
          <TabsContent value="program" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Cómo Funciona
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Comparte tu enlace</p>
                        <p className="text-sm text-muted-foreground">Envía tu enlace único a amigos y colegas</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Ellos se registran</p>
                        <p className="text-sm text-muted-foreground">Nuevos usuarios se registran usando tu enlace</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Ganas comisión</p>
                        <p className="text-sm text-muted-foreground">Recibes $25 por cada suscripción exitosa</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gift className="w-5 h-5 mr-2" />
                    Estructura de Comisiones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Plan Básico</span>
                      <span className="font-bold text-blue-600">$15</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                      <span className="font-medium">Plan Estándar</span>
                      <span className="font-bold text-emerald-600">$25</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">Plan Premium</span>
                      <span className="font-bold text-purple-600">$40</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Pagos mensuales el día 1</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
