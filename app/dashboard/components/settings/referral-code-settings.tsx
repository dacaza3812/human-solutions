"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client" // Client-side Supabase client
import { useAuth } from "@/contexts/auth-context"

export default function ReferralCodeSettings() {
  const { user } = useAuth()
  const [referralCode, setReferralCode] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const fetchReferralCode = async () => {
      if (user) {
        setLoading(true)
        const { data, error } = await supabase.from("profiles").select("referral_code").eq("id", user.id).single()

        if (error) {
          console.error("Error fetching referral code:", error)
          toast({
            title: "Error",
            description: "No se pudo cargar el código de referido.",
            variant: "destructive",
          })
        } else if (data) {
          setReferralCode(data.referral_code || "")
        }
        setLoading(false)
      }
    }
    fetchReferralCode()
  }, [user, toast, supabase])

  const handleGenerateCode = async () => {
    if (!user) return

    setLoading(true)
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase() // Simple random code

    const { error } = await supabase
      .from("profiles")
      .update({ referral_code: newCode, updated_at: new Date().toISOString() })
      .eq("id", user.id)

    if (error) {
      console.error("Error generating referral code:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el código de referido.",
        variant: "destructive",
      })
    } else {
      setReferralCode(newCode)
      toast({
        title: "Código Generado",
        description: "Tu nuevo código de referido ha sido generado.",
      })
    }
    setLoading(false)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
    toast({
      title: "Copiado",
      description: "Código de referido copiado al portapapeles.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Código de Referido</CardTitle>
        <CardDescription>Gestiona tu código único para referir nuevos clientes.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="referral-code">Tu Código de Referido</Label>
            <Input id="referral-code" value={referralCode} readOnly disabled={loading} className="font-mono" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleGenerateCode} disabled={loading}>
              {loading ? "Generando..." : "Generar Nuevo Código"}
            </Button>
            {referralCode && (
              <Button variant="outline" onClick={handleCopyCode} disabled={loading}>
                Copiar Código
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Comparte este código para que tus referidos obtengan beneficios y tú ganes comisiones.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
