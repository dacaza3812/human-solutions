"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { LinkIcon } from "lucide-react"

interface ReferralCodeSettingsProps {
  newReferralCode: string
  setNewReferralCode: (value: string) => void
  referralCodeUpdateMessage: string
  referralCodeUpdateError: string
  handleReferralCodeUpdate: (e: React.FormEvent) => Promise<void>
}

export function ReferralCodeSettings({
  newReferralCode,
  setNewReferralCode,
  referralCodeUpdateMessage,
  referralCodeUpdateError,
  handleReferralCodeUpdate,
}: ReferralCodeSettingsProps) {
  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <LinkIcon className="w-5 h-5 mr-2 text-orange-400" />
          Modificar Código de Referido
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleReferralCodeUpdate} className="space-y-4">
          <div>
            <Label htmlFor="newReferralCode">Nuevo Código de Referido</Label>
            <Input
              id="newReferralCode"
              type="text"
              value={newReferralCode}
              onChange={(e) => setNewReferralCode(e.target.value)}
              placeholder="Ej: TUCODIGOUNICO"
              required
            />
          </div>
          {referralCodeUpdateError && <p className="text-red-500 text-sm">{referralCodeUpdateError}</p>}
          {referralCodeUpdateMessage && <p className="text-emerald-500 text-sm">{referralCodeUpdateMessage}</p>}
          <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
            Actualizar Código
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
