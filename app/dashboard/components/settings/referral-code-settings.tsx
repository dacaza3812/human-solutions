"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Copy } from "lucide-react"

export default function ReferralCodeSettings() {
  const { user, fetchProfile, updateProfile } = useAuth()
  const { toast } = useToast()
  const [referralCode, setReferralCode] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadReferralCode = async () => {
      if (user) {
        const profile = await fetchProfile(user.id)
        if (profile && profile.referral_code) {
          setReferralCode(profile.referral_code)
        }
      }
    }
    loadReferralCode()
  }, [user, fetchProfile])

  const generateCode = async () => {
    setLoading(true)
    if (user) {
      // Simple random string for demonstration. In a real app, ensure uniqueness.
      const newCode = Math.random().toString(36).substring(2, 10).toUpperCase()
      const { error } = await updateProfile(user.id, { referral_code: newCode })
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        setReferralCode(newCode)
        toast({
          title: "Éxito",
          description: "Código de referido generado correctamente.",
        })
      }
    }
    setLoading(false)
  }

  const copyToClipboard = () => {
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
        <CardDescription>Genera y gestiona tu código de referido para invitar a nuevos usuarios.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="referral-code">Tu Código de Referido</Label>
            <div className="flex space-x-2 mt-1">
              <Input id="referral-code" value={referralCode} readOnly className="flex-1" />
              <Button type="button" onClick={copyToClipboard} disabled={!referralCode}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar
              </Button>
            </div>
            {!referralCode && (
              <p className="text-sm text-muted-foreground mt-2">Genera un código para empezar a compartir y ganar.</p>
            )}
          </div>
          <Button onClick={generateCode} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              "Generar Nuevo Código"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
