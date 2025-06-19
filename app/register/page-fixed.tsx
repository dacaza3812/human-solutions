"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context-final"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "", // Campo de teléfono
    accountType: "client" as "client" | "advisor",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const { signUp } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Obtener código de referido de la URL
  const referralCode = searchParams.get("ref") || ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    // Validaciones básicas
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setLoading(false)
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Por favor ingresa un email válido")
      setLoading(false)
      return
    }

    // Validar teléfono si se proporciona
    if (formData.phone && formData.phone.trim() !== "") {
      const phoneRegex = /^[\d\s\-+$$$$]+$/
      if (!phoneRegex.test(formData.phone.trim())) {
        setError("Por favor ingresa un número de teléfono válido")
        setLoading(false)
        return
      }
    }

    console.log("[REGISTER] Starting registration process...")
    console.log("[REGISTER] Form data:", {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      accountType: formData.accountType,
      hasReferralCode: !!referralCode,
      referralCode: referralCode || "None",
    })

    try {
      // Preparar datos del usuario
      const userData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone: formData.phone.trim(), // Incluir teléfono (puede estar vacío)
        account_type: formData.accountType,
      }

      console.log("[REGISTER] User data to send:", userData)
      console.log("[REGISTER] Referral code to send:", referralCode || "None")

      // Registrar usuario
      const { error } = await signUp(
        formData.email.trim(),
        formData.password,
        userData,
        referralCode || undefined, // Solo enviar si existe
      )

      if (error) {
        console.error("[REGISTER] Registration error:", error)
        setError(error.message || "Error al crear la cuenta")
        return
      }

      console.log("[REGISTER] Registration successful!")
      setSuccess("¡Cuenta creada exitosamente! Revisa tu email para confirmar tu cuenta.")

      // Redirigir después de un momento
      setTimeout(() => {
        router.push("/login?message=account-created")
      }, 2000)
    } catch (error) {
      console.error("[REGISTER] Unexpected error:", error)
      setError("Ocurrió un error inesperado. Por favor, inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Crear Cuenta</CardTitle>
          <CardDescription className="text-center">Ingresa tus datos para crear una nueva cuenta</CardDescription>
          {referralCode && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-2">
              <p className="text-sm text-green-800">
                <span className="font-medium">¡Registro con referido!</span>
                <br />
                Código: <code className="bg-green-100 px-1 rounded">{referralCode}</code>
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Tu nombre"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Tu apellido"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">El teléfono es opcional pero recomendado para contacto</p>
            </div>

            {/* Tipo de cuenta */}
            <div className="space-y-2">
              <Label htmlFor="accountType">Tipo de Cuenta *</Label>
              <select
                id="accountType"
                name="accountType"
                value={formData.accountType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              >
                <option value="client">Cliente</option>
                <option value="advisor">Asesor</option>
              </select>
            </div>

            {/* Contraseñas */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {/* Mensajes de error y éxito */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}

            {/* Botón de registro */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>

            {/* Link a login */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
