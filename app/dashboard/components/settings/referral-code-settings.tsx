"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { CheckCircleIcon, XCircleIcon, Loader2, CopyIcon, CheckIcon } from "lucide-react"

export function ReferralCodeSettings() {
  const { user, profile, updateUserProfile } = useAuth()
  const [newReferralCode, setNewReferralCode] = useState(profile?.referral_code || "")
  const [isUpdatingReferralCode, setIsUpdatingReferralCode] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    if (profile) {
      setNewReferralCode(profile.referral_code || "")
    }
  }, [profile])

  const handleReferralCodeUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingReferralCode(true)

    if (!newReferralCode.trim()) {
      toast({
        title: "Error",
        description: "El código de referido no puede estar vacío.",
        variant: "destructive",
        action: <XCircleIcon className="text-red-500" />,
      })
      setIsUpdatingReferralCode(false)
      return
    }
    if (!/^[a-zA-Z0-9]+$/.test(newReferralCode)) {
      toast({
        title: "Error",
        description: "El código de referido solo puede contener letras y números.",
        variant: "destructive",
        action: <XCircleIcon className="text-red-500" />,
      })
      setIsUpdatingReferralCode(false)
      return
    }

    const { error } = await updateUserProfile({ referral_code: newReferralCode })

    if (error) {
      toast({
        title: "Error",
        description: `Error al actualizar código de referido: ${error.message}`,
        variant: "destructive",
        action: <XCircleIcon className="text-red-500" />,
      })
    } else {
      toast({
        title: "Éxito",
        description: "Código de referido actualizado exitosamente.",
        action: <CheckCircleIcon className="text-green-500" />,
      })
    }
    setIsUpdatingReferralCode(false)
  }

  const copyReferralLink = async () => {
    const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/register?ref=${newReferralCode}`
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopySuccess(true)
      toast({
        title: "Copiado",
        description: "Enlace de referido copiado al portapapeles.",
        action: <CheckIcon className="text-green-500" />,
      })
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Error copying to clipboard:", err)
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleReferralCodeUpdate} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="referral-code">Tu Código de Referido</Label>
        <Input
          id="referral-code"
          value={newReferralCode}
          onChange={(e) => setNewReferralCode(e.target.value)}
          placeholder="Genera o ingresa un código"
          required
        />
      </div>
      <Button type="submit" disabled={isUpdatingReferralCode}>
        {isUpdatingReferralCode ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Actualizando...
          </>
        ) : (
          "Actualizar Código de Referido"
        )}
      </Button>
      {newReferralCode && (
        <div className="space-y-2 mt-4">
          <Label htmlFor="referral-link-display">Enlace de Referido</Label>
          <div className="flex space-x-2">
            <Input
              id="referral-link-display"
              readOnly
              value={`${process.env.NEXT_PUBLIC_BASE_URL}/register?ref=${newReferralCode}`}
              className="flex-1"
            />
            <Button onClick={copyReferralLink} disabled={copySuccess} type="button">
              {copySuccess ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
              <span className="sr-only">Copiar enlace</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Comparte este enlace para invitar a nuevos usuarios.</p>
        </div>
      )}
    </form>
  )
}
