"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Copy } from "lucide-react"

export function ReferralCodeSettings() {
  const { user, profile, updateUserProfile } = useAuth()
  const [referralCode, setReferralCode] = useState(profile?.referral_code || "")
  const [newReferralCode, setNewReferralCode] = useState(profile?.referral_code || "")
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    if (profile?.referral_code) {
      setReferralCode(profile.referral_code)
      setNewReferralCode(profile.referral_code)
    } else if (user) {
      // If no referral code exists, generate one
      const generateAndSetReferralCode = async () => {
        const firstName = profile?.first_name?.toLowerCase() || ""
        const lastName = profile?.last_name?.toLowerCase() || ""
        const randomNum = Math.floor(Math.random() * 10000)
        const generatedCode = `${firstName}${lastName}${randomNum}`.replace(/[^a-z0-9]/g, "") // Sanitize
        setReferralCode(generatedCode)
        setNewReferralCode(generatedCode)
        // Update profile in DB
        const { error } = await updateUserProfile({ referral_code: generatedCode })
        if (error) {
          console.error("Error generating and saving referral code:", error)
        }
      }
      generateAndSetReferralCode()
    }
  }, [profile, user, updateUserProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setIsError(false)

    if (!newReferralCode.trim()) {
      setMessage("El código de referido no puede estar vacío.")
      setIsError(true)
      return
    }
    if (!/^[a-zA-Z0-9]+$/.test(newReferralCode)) {
      setMessage("El código de referido solo puede contener letras y números.")
      setIsError(true)
      return
    }

    const { error } = await updateUserProfile({ referral_code: newReferralCode })

    if (error) {
      setMessage(`Error al actualizar código de referido: ${error.message}`)
      setIsError(true)
    } else {
      setMessage("Código de referido actualizado exitosamente.")
      setIsError(false)
      setReferralCode(newReferralCode) // Update the displayed code
    }
  }

  const copyReferralLink = async () => {
    const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/register?ref=${referralCode}`
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Error copying to clipboard:", err)
      setMessage("Error al copiar el enlace.")
      setIsError(true)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <Alert variant={isError ? "destructive" : "default"}>
          {isError ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertTitle>{isError ? "Error" : "Éxito"}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      <div>
        <Label htmlFor="referralCode">Tu Código de Referido Actual</Label>
        <div className="flex items-center space-x-2 mt-1">
          <Input id="referralCode" value={referralCode} readOnly className="flex-1" />
          <Button type="button" onClick={copyReferralLink} size="icon" className="shrink-0">
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copiar Enlace</span>
          </Button>
        </div>
        {copySuccess && <p className="text-xs text-emerald-500 mt-1">¡Enlace copiado!</p>}
      </div>
      <div>
        <Label htmlFor="newReferralCode">Cambiar Código de Referido</Label>
        <Input
          id="newReferralCode"
          value={newReferralCode}
          onChange={(e) => setNewReferralCode(e.target.value)}
          className="mt-1"
          placeholder="Nuevo código (letras y números)"
        />
      </div>
      <Button type="submit">Actualizar Código</Button>
    </form>
  )
}
