"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function NewCaseForm() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      alert("Caso enviado con éxito!")
    }, 2000)
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Crear Nuevo Caso</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="case-title">Título del Caso</Label>
              <Input id="case-title" placeholder="Ej. Problema de herencia" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-name">Nombre del Cliente</Label>
              <Input id="client-name" placeholder="Nombre completo del cliente" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción del Caso</Label>
            <Textarea id="description" placeholder="Detalles completos del caso..." rows={5} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financiero</SelectItem>
                  <SelectItem value="family">Familiar</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="personal">Desarrollo Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in-progress">En Progreso</SelectItem>
                  <SelectItem value="resolved">Resuelto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due-date">Fecha Límite (Opcional)</Label>
            <Input id="due-date" type="date" />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando Caso...
              </>
            ) : (
              "Crear Caso"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
