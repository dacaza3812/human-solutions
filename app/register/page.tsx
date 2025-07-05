"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const refCode = searchParams.get("ref")
    if (refCode) {
      setReferralCode(refCode)
    }
  }, [searchParams])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast({
        title: "Error de registro",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      })
      return
    }
    if (password.length < 6) {
      toast({
        title: "Error de registro",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password, name, referralCode)
    setLoading(false)

    if (error) {
      toast({
        title: "Error de registro",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Registro exitoso",
        description: "Por favor, revisa tu correo para verificar tu cuenta.",
      })
      router.push("/login") // Redirect to login after successful registration
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Registrarse</CardTitle>
          <CardDescription>Crea una cuenta para comenzar tu transformación.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="referral-code">Código de Referido (Opcional)</Label>
              <Input
                id="referral-code"
                type="text"
                placeholder="Ingresa un código si tienes uno"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Registrarse"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-emerald-400 hover:underline">
              Iniciar Sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
