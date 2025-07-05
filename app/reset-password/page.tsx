"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const { resetPasswordForEmail } = useAuth()
  const { toast } = useToast()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await resetPasswordForEmail(email)
    setLoading(false)

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Correo enviado",
        description: "Revisa tu bandeja de entrada para las instrucciones de restablecimiento de contraseña.",
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Restablecer Contraseña</CardTitle>
          <CardDescription>Ingresa tu correo electrónico para recibir un enlace de restablecimiento.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Enlace de Restablecimiento"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="text-muted-foreground hover:underline">
              Volver al inicio de sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
