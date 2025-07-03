"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, XCircle } from "lucide-react"

export default function NewCaseForm() {
  const [consultationType, setConsultationType] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [priorityLevel, setPriorityLevel] = useState("")
  const [description, setDescription] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files))
    }
  }

  const handleRemoveFile = (fileName: string) => {
    setSelectedFiles(selectedFiles.filter((file) => file.name !== fileName))
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    // Here you would typically send this data to your backend
    console.log({
      consultationType,
      clientName,
      clientEmail,
      clientPhone,
      priorityLevel,
      description,
      selectedFiles: selectedFiles.map((file) => file.name), // Just names for console log
    })
    alert("Formulario de nuevo caso enviado (simulado). Revisa la consola para ver los datos.")
    // Reset form or close modal
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <div className="grid gap-4">
        {/* Consultation Type */}
        <div className="space-y-2">
          <Label htmlFor="consultation-type">Tipo de Consulta</Label>
          <Select value={consultationType} onValueChange={setConsultationType}>
            <SelectTrigger id="consultation-type">
              <SelectValue placeholder="Selecciona el tipo de consulta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="informal">Informal</SelectItem>
              <SelectItem value="comercial">Comercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contact Information */}
        <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg">Datos de Contacto</CardTitle>
            <CardDescription>Información del cliente para el caso.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Nombre Completo</Label>
              <Input
                id="client-name"
                placeholder="Nombre del cliente"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">Correo Electrónico</Label>
              <Input
                id="client-email"
                type="email"
                placeholder="cliente@ejemplo.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-phone">Número de Teléfono</Label>
              <Input
                id="client-phone"
                type="tel"
                placeholder="+1234567890"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Priority Level */}
        <div className="space-y-2">
          <Label htmlFor="priority-level">Tipo de Prioridad</Label>
          <Select value={priorityLevel} onValueChange={setPriorityLevel}>
            <SelectTrigger id="priority-level">
              <SelectValue placeholder="Selecciona la prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baja">Baja</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            placeholder="Describe detalladamente el caso..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            required
          />
          <p className="text-sm text-muted-foreground">
            Nota: Para una edición de texto más avanzada (negritas, listas, etc.), se integraría un editor de texto
            enriquecido.
          </p>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <Label htmlFor="images">Imágenes (Opcional)</Label>
          <div className="flex items-center justify-center w-full">
            <Label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/30 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF (Máx. 5MB por archivo)</p>
              </div>
              <Input
                id="dropzone-file"
                type="file"
                className="hidden"
                multiple
                onChange={handleFileChange}
                accept="image/*"
              />
            </Label>
          </div>
          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium">Archivos seleccionados:</p>
              <ul className="space-y-1">
                {selectedFiles.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between text-sm text-muted-foreground bg-muted p-2 rounded-md"
                  >
                    <span>
                      {file.name} ({Math.round(file.size / 1024)} KB)
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(file.name)}
                      className="h-auto p-1"
                    >
                      <XCircle className="w-4 h-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600">
        Crear Nuevo Caso
      </Button>
    </form>
  )
}
