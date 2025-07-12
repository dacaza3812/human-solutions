// app/cases/new/new-case-form.tsx
"use client"
import { useState, useRef, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { submitCreateCase } from "@/actions/createcase2"
import { useAuth } from "@/contexts/auth-context"

export default function NewCaseForm() {
  const [isPending, setIsPending] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const {user} = useAuth()// Reemplaza con la lógica para obtener el ID del usuario actual
    const userId = user?.id || ""
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    setIsPending(true)
    try {
      const res = await submitCreateCase(formData, userId)
      toast({ title: "Caso creado", description: `ID: ${res.caseId}` })
      form.reset()
      setFile(null)
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsPending(false)
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 p-4 max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Crear Nuevo Caso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Título del Caso</Label>
            <Input id="title" name="title" required />
          </div>
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" rows={4} required />
          </div>
          <div>
            <Label>Adjuntar archivo (opcional)</Label>
            <input
              type="file"
              name="file"
              hidden
              ref={fileInputRef}
              onChange={onFileChange}
            />
            <Button
              variant="outline"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {file?.name ?? "Seleccionar archivo"}
            </Button>
            {file && (
              <div className="mt-2 flex items-center space-x-2">
                <span className="truncate">{file.name}</span>
                <XCircle className="cursor-pointer" onClick={() => setFile(null)} />
              </div>
            )}
          </div>
          <Button type="submit" disabled={isPending} className="flex items-center">
            {isPending && <Loader2 className="mr-2 animate-spin" />}
            Crear Caso
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
