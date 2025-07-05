"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogFooter } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/components/ui/use-toast"

interface NewCaseFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function NewCaseForm({ onSuccess, onCancel }: NewCaseFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [caseType, setCaseType] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [dueDate, setDueDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear un caso.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    const { error } = await supabase.from("cases").insert({
      title,
      description,
      case_type: caseType,
      priority,
      due_date: dueDate || null,
      client_id: user.id,
      status: "open",
      progress: 0,
    })

    if (error) {
      console.error("Error creating new case:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el nuevo caso.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Éxito",
        description: "Nuevo caso creado exitosamente.",
      })
      onSuccess() // Call the success callback
    }
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título del Caso</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. Asesoría Legal para Contrato"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalla el problema o la necesidad..."
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="case-type">Tipo de Caso</Label>
          <Input
            id="case-type"
            value={caseType}
            onChange={(e) => setCaseType(e.target.value)}
            placeholder="Ej. Legal, Financiero, Familiar"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Prioridad</Label>
          <Select value={priority} onValueChange={(value) => setPriority(value as "low" | "medium" | "high")}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baja</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="due-date">Fecha Límite (Opcional)</Label>
        <Input id="due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} type="button">
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            "Crear Caso"
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}
