"use client"

import { useActionState, useTransition } from "react"
import { submitContactForm } from "@/actions/contact"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, {
    success: false,
    message: "",
    errors: {},
  })
  const [isPending, startTransition] = useTransition()

  // Show toast messages based on the action state
  if (state.message) {
    toast({
      title: state.success ? "Éxito" : "Error",
      description: state.message,
      variant: state.success ? "default" : "destructive",
    })
    // Reset message after showing toast to prevent it from reappearing on re-renders
    state.message = ""
  }

  return (
    <form
      action={(formData) => {
        startTransition(() => formAction(formData))
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName">Nombre</Label>
          <Input id="firstName" name="firstName" placeholder="Tu nombre" required />
          {state.errors?.firstName && <p className="text-sm text-red-500">{state.errors.firstName[0]}</p>}
        </div>
        <div>
          <Label htmlFor="lastName">Apellido</Label>
          <Input id="lastName" name="lastName" placeholder="Tu apellido" required />
          {state.errors?.lastName && <p className="text-sm text-red-500">{state.errors.lastName[0]}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input id="email" name="email" type="email" placeholder="tu@ejemplo.com" required />
        {state.errors?.email && <p className="text-sm text-red-500">{state.errors.email[0]}</p>}
      </div>
      <div>
        <Label htmlFor="phone">Teléfono (Opcional)</Label>
        <Input id="phone" name="phone" type="tel" placeholder="+1 234 567 8900" />
        {state.errors?.phone && <p className="text-sm text-red-500">{state.errors.phone[0]}</p>}
      </div>
      <div>
        <Label htmlFor="message">Mensaje</Label>
        <Textarea id="message" name="message" placeholder="Escribe tu mensaje aquí..." rows={5} required />
        {state.errors?.message && <p className="text-sm text-red-500">{state.errors.message[0]}</p>}
      </div>
      <div>
        <Label htmlFor="file">Adjuntar Archivo (Opcional)</Label>
        <Input id="file" name="file" type="file" />
        {state.errors?.file && <p className="text-sm text-red-500">{state.errors.file[0]}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          "Enviar Mensaje"
        )}
      </Button>
    </form>
  )
}
