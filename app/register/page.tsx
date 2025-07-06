"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User, Phone, AlertCircle, CheckCircle, Gift } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useSearchParams } from "next/navigation"

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    accountType: "client" as "client" | "advisor",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [referralCode, setReferralCode] = useState("")

  const { signUp, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for referral code in URL
  useEffect(() => {
    const refCode = searchParams.get("ref")
    if (refCode) {
      setReferralCode(refCode)
    }
  }, [searchParams])
  

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError("El nombre es requerido")
      return false
    }
    if (!formData.lastName.trim()) {
      setError("El apellido es requerido")
      return false
    }
    if (!formData.email.trim()) {
      setError("El correo electrónico es requerido")
      return false
    }
    if (!formData.password) {
      setError("La contraseña es requerida")
      return false
    }
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return false
    }
    if (!formData.acceptTerms) {
      setError("Debes aceptar los términos y condiciones")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) return

    setLoading(true)

    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          account_type: formData.accountType,
        },
        referralCode || undefined,
      )

      if (error) {
        setError(error.message || "Error al crear la cuenta")
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError("Error inesperado. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border/40 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl text-foreground">¡Cuenta Creada!</CardTitle>
            <CardDescription>
              Hemos enviado un correo de confirmación a {formData.email}. Por favor, verifica tu correo para activar tu
              cuenta.
              {referralCode && (
                <div className="mt-2 p-2 bg-emerald-500/10 rounded-lg">
                  <p className="text-sm text-emerald-400">¡Te registraste con un código de referido!</p>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600">Ir al inicio de sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src="/fox-lawyer-logo.png" alt="Fox Lawyer" className="w-12 h-12" />
            <h1 className="text-2xl font-bold text-foreground">Fox Lawyer</h1>
          </div>
          <p className="text-muted-foreground">Asesoría legal personalizada y profesional</p>
        </div>

        {/* Register Form */}
        <Card className="border-border/40 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Crear Cuenta</CardTitle>
            <CardDescription>
              Únete a nuestra plataforma de asesoría legal
              {referralCode && (
                <div className="mt-2 flex items-center justify-center space-x-2 text-emerald-400">
                  <Gift className="w-4 h-4" />
                  <span className="text-sm">Invitado por un referido</span>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Referral Code Display */}
              {referralCode && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">Código de referido: {referralCode}</span>
                  </div>
                </div>
              )}

              {/* Account Type Selection */}
              {/* <div className="space-y-2">
                <Label className="text-sm font-medium">Tipo de Cuenta</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: "client" })}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      formData.accountType === "client"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                        : "border-border/40 text-muted-foreground hover:text-foreground"
                    }`}
                    disabled={loading}
                  >
                    Cliente
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: "advisor" })}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      formData.accountType === "advisor"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                        : "border-border/40 text-muted-foreground hover:text-foreground"
                    }`}
                    disabled={loading}
                  >
                    Asesor
                  </button>
                </div>
              </div> */}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    Nombre *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Tu nombre"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="pl-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Apellido *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Tu apellido"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Correo Electrónico *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Teléfono
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmar Contraseña *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirma tu contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 pr-10"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <input
                  id="terms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  className="w-4 h-4 text-emerald-500 border-border rounded focus:ring-emerald-500 mt-1"
                  required
                  disabled={loading}
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                  Acepto los{" "}
                  <Link href="#" className="text-emerald-400 hover:text-emerald-300">
                    Términos y Condiciones
                  </Link>{" "}
                  y la{" "}
                  <Link href="#" className="text-emerald-400 hover:text-emerald-300">
                    Política de Privacidad
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                disabled={loading}
              >
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Theme Toggle */}
        <div className="flex justify-center mt-6">
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
