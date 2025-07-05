"use client"

import { Badge } from "@/components/ui/badge"

import { Label } from "@/components/ui/label"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase-server"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Copy, Share2 } from "lucide-react"
import { Input } from "@/components/ui/input"

export default async function ReferralsSection() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <p>Por favor, inicia sesión para ver tus referidos.</p>
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, referral_code")
    .eq("id", user.id)
    .single()

  if (profileError || profile?.role !== "advisor") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Programa de Referidos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Este programa está disponible solo para asesores. Si estás interesado en unirte, contáctanos.
          </p>
        </CardContent>
      </Card>
    )
  }

  const referralCode = profile.referral_code || "Generando..." // Fallback if not yet generated

  const { data: referrals, error } = await supabase
    .from("referrals")
    .select("*, referred_user:referred_user_id(name, email)")
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching referrals:", error)
    return <p>Error al cargar los referidos: {error.message}</p>
  }

  const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/register?ref=${referralCode}`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Referidos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Label htmlFor="referral-link" className="mb-2 block text-sm font-medium">
            Tu Enlace de Referido
          </Label>
          <div className="flex space-x-2">
            <Input id="referral-link" readOnly value={referralLink} className="flex-1" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigator.clipboard.writeText(referralLink)}
              title="Copiar enlace"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" title="Compartir">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Comparte este enlace para que tus referidos se registren.
          </p>
        </div>

        {referrals.length === 0 ? (
          <p className="text-muted-foreground">Aún no tienes referidos.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Referido</TableHead>
                <TableHead>Email del Referido</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell className="font-medium">{referral.referred_user?.name || "N/A"}</TableCell>
                  <TableCell>{referral.referred_user?.email || "N/A"}</TableCell>
                  <TableCell>{format(new Date(referral.created_at), "PPP", { locale: es })}</TableCell>
                  <TableCell>
                    {/* You might want a status for referral, e.g., 'signed_up', 'subscribed' */}
                    <Badge variant="secondary">Registrado</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
