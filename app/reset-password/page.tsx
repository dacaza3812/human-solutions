"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isUpdateMode, setIsUpdateMode] = useState(false)
  const { resetPassword } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const type = searchParams.get("type")
    if (type === "recovery") {
      setIsUpdateMode(true)
    }
  }, [searchParams])

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await resetPassword(email)
    if (error) {
      toast({
        title: "Error al solicitar restablecimiento",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Correo enviado",
        description: "Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico.",
      })
    }
    setLoading(false)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        toast({
          title: "Error al actualizar contraseña",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Contraseña actualizada",
          description: "Tu contraseña ha sido actualizada exitosamente. Ahora puedes iniciar sesión.",
        })
        router.push("/login")
      }
    } catch (error: any) {
      toast({
        title: "Error inesperado",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            {isUpdateMode ? "Actualizar Contraseña" : "Restablecer Contraseña"}
          </CardTitle>
          <CardDescription>
            {isUpdateMode
              ? "Ingresa tu nueva contraseña."
              : "Ingresa tu correo electrónico para recibir un enlace de restablecimiento."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isUpdateMode ? (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva Contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={loading}>
                {loading ? "Actualizando..." : "Actualizar Contraseña"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={loading}>
                {loading ? "Enviando..." : "Enviar Enlace de Restablecimiento"}
              </Button>
            </form>
          )}
          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="font-medium text-emerald-600 hover:underline">
              Volver al inicio de sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
