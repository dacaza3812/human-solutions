"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload } from "lucide-react"
import { createClient } from "@/lib/supabase" // Client-side Supabase
import { useRouter } from "next/navigation"

export default function NewCaseForm() {
  const { user } = useAuth()
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [priority, setPriority] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setSelectedFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para abrir un nuevo caso.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    let fileUrl: string | null = null
    if (selectedFile) {
      const filePath = `case_attachments/${user.id}/${Date.now()}_${selectedFile.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("case_attachments")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.error("Error uploading file:", uploadError)
        toast({
          title: "Error al subir archivo",
          description: uploadError.message,
          variant: "destructive",
        })
        setLoading(false)
        return
      }
      fileUrl = uploadData.path
    }

    const { error } = await supabase.from("cases").insert({
      client_id: user.id,
      title,
      description,
      category,
      priority,
      attachment_url: fileUrl,
      status: "open", // Default status for new cases
    })

    if (error) {
      console.error("Error creating case:", error)
      toast({
        title: "Error al abrir caso",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Caso Abierto",
        description: "Tu nuevo caso ha sido creado con éxito.",
      })
      router.push("/dashboard/cases") // Redirect to cases list
    }
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Abrir Nuevo Caso</CardTitle>
        <CardDescription>Completa los detalles para iniciar un nuevo caso de asesoría.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Título del Caso</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Problema con hipoteca"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Descripción Detallada</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe tu situación y lo que esperas lograr..."
              rows={5}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financiera">Asesoría Financiera</SelectItem>
                  <SelectItem value="familiar">Relaciones Familiares</SelectItem>
                  <SelectItem value="legal">Asesoría Legal</SelectItem>
                  <SelectItem value="personal">Desarrollo Personal</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Prioridad</Label>
              <Select value={priority} onValueChange={setPriority} required>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Selecciona la prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="attachment">Adjuntar Documento (Opcional)</Label>
            <div className="mt-1">
              <Input
                id="attachment"
                name="attachment"
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-dashed"
              >
                <Upload className="w-4 h-4 mr-2" />
                {selectedFile ? selectedFile.name : "Seleccionar archivo"}
              </Button>
              {selectedFile && (
                <p className="text-sm text-muted-foreground mt-2">Archivo seleccionado: {selectedFile.name}</p>
              )}
            </div>
          </div>
          <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Abriendo caso...
              </>
            ) : (
              "Abrir Caso"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
