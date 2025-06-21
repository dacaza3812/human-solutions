"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { Save, CheckCircle, AlertCircle } from "lucide-react"

export function SettingsSection() {
  const { user, profile, updateUserProfile, changePassword } = useAuth()

  // State for Settings section
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [passwordChangeMessage, setPasswordChangeMessage] = useState("")
  const [passwordChangeError, setPasswordChangeError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)

  const [firstName, setFirstName] = useState(profile?.first_name || "")
  const [lastName, setLastName] = useState(profile?.last_name || "")
  const [profileUpdateMessage, setProfileUpdateMessage] = useState("")
  const [profileUpdateError, setProfileUpdateError] = useState("")

  const [newReferralCode, setNewReferralCode] = useState(profile?.referral_code || "")
  const [referralCodeUpdateMessage, setReferralCodeUpdateMessage] = useState("")
  const [referralCodeUpdateError, setReferralCodeUpdateError] = useState("")

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "")
      setLastName(profile.last_name || "")
      setNewReferralCode(profile.referral_code || "")
    }
  }, [profile])

  // Password strength validation
  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) strength += 25
    return strength
  }

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(newPassword))
  }, [newPassword])

  // Handle password change
  const handlePasswordChange = async () => {
    setPasswordChangeMessage("")
    setPasswordChangeError("")

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError("Las contraseñas no coinciden")
      return
    }

    if (passwordStrength < 75) {
      setPasswordChangeError("La contraseña debe ser más fuerte")
      return
    }

    try {
      const { error } = await changePassword(newPassword)
      if (error) {
        setPasswordChangeError(error.message)
      } else {
        setPasswordChangeMessage("Contraseña actualizada exitosamente")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmNewPassword("")
        toast({
          title: "Contraseña actualizada",
          description: "Tu contraseña ha sido cambiada exitosamente.",
        })
      }
    } catch (error) {
      setPasswordChangeError("Error al cambiar la contraseña")
    }
  }

  // Handle profile update
  const handleProfileUpdate = async () => {
    setProfileUpdateMessage("")
    setProfileUpdateError("")

    if (!firstName.trim() || !lastName.trim()) {
      setProfileUpdateError("El nombre y apellido son requeridos")
      return
    }

    try {
      const { error } = await updateUserProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      })

      if (error) {
        setProfileUpdateError(error.message)
      } else {
        setProfileUpdateMessage("Perfil actualizado exitosamente")
        toast({
          title: "Perfil actualizado",
          description: "Tu información personal ha sido actualizada.",
        })
      }
    } catch (error) {
      setProfileUpdateError("Error al actualizar el perfil")
    }
  }

  // Handle referral code update
  const handleReferralCodeUpdate = async () => {
    setReferralCodeUpdateMessage("")
    setReferralCodeUpdateError("")

    if (!newReferralCode.trim()) {
      setReferralCodeUpdateError("El código de referido es requerido")
      return
    }

    if (newReferralCode.length < 3) {
      setReferralCodeUpdateError("El código debe tener al menos 3 caracteres")
      return
    }

    try {
      const { error } = await updateUserProfile({
        referral_code: newReferralCode.trim(),
      })

      if (error) {
        setReferralCodeUpdateError(error.message)
      } else {
        setReferralCodeUpdateMessage("Código de referido actualizado exitosamente")
        toast({
          title: "Código actualizado",
          description: "Tu código de referido ha sido actualizado.",
        })
      }
    } catch (error) {
      setReferralCodeUpdateError("Error al actualizar el código de referido")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Configuración de la Cuenta</h2>
          <p className="text-muted-foreground">Gestiona tu información personal y de seguridad</p>
        </div>
      </div>

      {/* Personal Information */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-foreground">Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Tu apellido"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Tipo de Cuenta</Label>
              <Input value={profile?.account_type || ""} disabled className="bg-muted capitalize" />
            </div>
          </div>
          {profileUpdateMessage && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{profileUpdateMessage}</AlertDescription>
            </Alert>
          )}
          {profileUpdateError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{profileUpdateError}</AlertDescription>
            </Alert>
          )}
          <Button onClick={handleProfileUpdate} className="w-full md:w-auto">
            <Save className="w-4 h-4 mr-2" />
            Actualizar Información
          </Button>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-foreground">Cambiar Contraseña</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="newPassword">Nueva Contraseña</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Ingresa tu nueva contraseña"
            />
            {newPassword && (
              <div className="mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Fortaleza de la contraseña</span>
                  <span>{passwordStrength}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      passwordStrength < 50 ? "bg-red-500" : passwordStrength < 75 ? "bg-yellow-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos.
                </p>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="confirmNewPassword">Confirmar Nueva Contraseña</Label>
            <Input
              id="confirmNewPassword"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Confirma tu nueva contraseña"
            />
          </div>
          {passwordChangeMessage && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{passwordChangeMessage}</AlertDescription>
            </Alert>
          )}
          {passwordChangeError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{passwordChangeError}</AlertDescription>
            </Alert>
          )}
          <Button onClick={handlePasswordChange} className="w-full md:w-auto">
            <Save className="w-4 h-4 mr-2" />
            Cambiar Contraseña
          </Button>
        </CardContent>
      </Card>

      {/* Referral Code - Only for Clients */}
      {profile?.account_type === "client" && (
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-foreground">Código de Referido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="newReferralCode">Tu Código de Referido</Label>
              <Input
                id="newReferralCode"
                value={newReferralCode}
                onChange={(e) => setNewReferralCode(e.target.value)}
                placeholder="Ingresa tu código de referido personalizado"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Este código será usado por otros usuarios para referenciarte. Debe tener al menos 3 caracteres.
              </p>
            </div>
            {referralCodeUpdateMessage && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{referralCodeUpdateMessage}</AlertDescription>
              </Alert>
            )}
            {referralCodeUpdateError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{referralCodeUpdateError}</AlertDescription>
              </Alert>
            )}
            <Button onClick={handleReferralCodeUpdate} className="w-full md:w-auto">
              <Save className="w-4 h-4 mr-2" />
              Actualizar Código
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
