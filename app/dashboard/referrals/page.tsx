"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, XCircle, FileText } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ReferralStats {
  total_referred: number
  active_referred: number
}

interface ReferredUser {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  created_at: string
  is_active: boolean
}

export default function ReferralsPage() {
  const { profile, loading: authLoading } = useAuth()
  const [referralCode, setReferralCode] = useState("")
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null)
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const fetchReferralData = useCallback(async () => {
    if (!profile?.id) {
      setLoadingData(false)
      return
    }

    setLoadingData(true)
    try {
      // Fetch referral code
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", profile.id)
        .single()

      if (profileError) {
        console.error("Error fetching referral code:", profileError)
        toast({
          title: "Error",
          description: "No se pudo cargar tu código de referido.",
          variant: "destructive",
        })
      } else if (profileData?.referral_code) {
        setReferralCode(profileData.referral_code)
      }

      // Fetch referral stats
      const { data: statsData, error: statsError } = await supabase.rpc("get_referral_stats")

      if (statsError) {
        console.error("Error fetching referral stats:", statsError)
        toast({
          title: "Error",
          description: "No se pudieron cargar las estadísticas de referidos.",
          variant: "destructive",
        })
      } else {
        setReferralStats(statsData)
      }

      // Fetch referred users
      const { data: usersData, error: usersError } = await supabase.rpc("get_referred_users")

      if (usersError) {
        console.error("Error fetching referred users:", usersError)
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios referidos.",
          variant: "destructive",
        })
      } else {
        setReferredUsers(usersData || [])
      }
    } catch (error) {
      console.error("Unexpected error fetching referral data:", error)
      toast({
        title: "Error Inesperado",
        description: "Ocurrió un error al cargar los datos de referidos.",
        variant: "destructive",
      })
    } finally {
      setLoadingData(false)
    }
  }, [profile?.id])

  useEffect(() => {
    if (!authLoading) {
      fetchReferralData()
    }
  }, [authLoading, fetchReferralData])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
    toast({
      title: "Copiado!",
      description: "Código de referido copiado al portapapeles.",
    })
  }

  if (authLoading || loadingData) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Cargando...</h3>
        <p className="text-muted-foreground">Cargando información de referidos.</p>
      </div>
    )
  }

  if (profile?.account_type !== "client") {
    return (
      <div className="text-center py-12">
        <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-foreground mb-2">Acceso Denegado</h3>
        <p className="text-muted-foreground">Solo los usuarios con cuenta de cliente pueden acceder a esta sección.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Programa de Referidos</h2>
          <p className="text-muted-foreground">Invita a tus amigos y gana beneficios.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tu Código de Referido</CardTitle>
          <CardDescription>Comparte este código para invitar a nuevos usuarios.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center space-x-2">
          <Input readOnly value={referralCode} className="flex-1" />
          <Button onClick={handleCopyCode}>
            <Copy className="h-4 w-4 mr-2" /> Copiar
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de Referidos</CardTitle>
            <CardDescription>Un resumen de tus referidos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <span className="font-semibold">Total Referidos:</span> {referralStats?.total_referred ?? 0}
            </p>
            <p>
              <span className="font-semibold">Referidos Activos:</span> {referralStats?.active_referred ?? 0}
            </p>
            {/* Add more stats if available, e.g., earnings */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Beneficios del Programa</CardTitle>
            <CardDescription>Lo que ganas por cada referido.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Gana un 10% de comisión por cada suscripción activa de tus referidos.</li>
              <li>Acceso anticipado a nuevas funciones.</li>
              <li>Soporte prioritario para ti y tus referidos.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios Referidos</CardTitle>
          <CardDescription>Lista de usuarios que se registraron con tu código.</CardDescription>
        </CardHeader>
        <CardContent>
          {referredUsers.length === 0 ? (
            <p className="text-muted-foreground">Aún no tienes usuarios referidos.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {user.first_name || "N/A"} {user.last_name || ""}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{user.is_active ? "Activo" : "Inactivo"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
