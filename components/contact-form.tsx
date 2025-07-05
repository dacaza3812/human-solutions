"use client"

import type React from "react"
import { useState, useRef, useTransition, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Upload, Loader2, File } from "lucide-react"
import { submitContactForm } from "@/actions/contact"
import { useToast } from "@/components/ui/use-toast"

interface SubmitButtonProps {
  isPending: boolean
}

function SubmitButton({ isPending }: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={isPending} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Enviando...
        </>
      ) : (
        "Enviar Mensaje"
      )}
    </Button>
  )
}

export default function ContactForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const contactFormRef = useRef<HTMLFormElement>(null)

  const [isPending, startTransition] = useTransition()
  const [formState, setFormState] = useState({
    success: false,
    message: "",
    errors: {} as Record<string, string[]>,
  })
  const { toast } = useToast()

  useEffect(() => {
    if (formState.message) {
      toast({
        title: formState.success ? "Éxito" : "Error",
        description: formState.message,
        variant: formState.success ? "default" : "destructive",
      })
      if (formState.success) {
        contactFormRef.current?.reset()
        setSelectedFile(null)
        setFilePreviewUrl(null)
      }
    }
  }, [formState.message, formState.success, toast])

  const handleContactFormSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await submitContactForm(formState, formData)
      setFormState(result)
    })
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setSelectedFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreviewUrl(null)
    }
  }

  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="text-center text-emerald-400">Formulario de Contacto</CardTitle>
        <CardDescription className="text-center">
          Completa el formulario y nos pondremos en contacto contigo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form ref={contactFormRef} action={handleContactFormSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Nombre</Label>
              <Input id="firstName" name="firstName" placeholder="Tu nombre" className="mt-1" />
              {formState.errors?.firstName && (
                <p className="text-red-500 text-sm mt-1">{formState.errors.firstName[0]}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Apellido</Label>
              <Input id="lastName" name="lastName" placeholder="Tu apellido" className="mt-1" />
              {formState.errors?.lastName && (
                <p className="text-red-500 text-sm mt-1">{formState.errors.lastName[0]}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" name="email" type="email" placeholder="tu@ejemplo.com" className="mt-1" />
            {formState.errors?.email && <p className="text-red-500 text-sm mt-1">{formState.errors.email[0]}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Teléfono (opcional)</Label>
            <Input id="phone" name="phone" type="tel" placeholder="+52 123 456 7890" className="mt-1" />
            {formState.errors?.phone && <p className="text-red-500 text-sm mt-1">{formState.errors.phone[0]}</p>}
          </div>

          <div>
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Cuéntanos sobre tu situación y objetivos..."
              rows={4}
              className="mt-1"
            />
            {formState.errors?.message && <p className="text-red-500 text-sm mt-1">{formState.errors.message[0]}</p>}
          </div>

          <div>
            <Label htmlFor="file">Subir Documento (opcional)</Label>
            <div className="mt-1">
              <Input
                id="file"
                name="file"
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
              {formState.errors?.file && <p className="text-red-500 text-sm mt-1">{formState.errors.file[0]}</p>}
              {filePreviewUrl && (
                <div className="mt-2 flex items-center space-x-2">
                  {selectedFile?.type.startsWith("image/") ? (
                    <Image
                      src={filePreviewUrl || "/placeholder.svg"}
                      alt="File preview"
                      width={64}
                      height={64}
                      className="rounded-md object-cover"
                    />
                  ) : (
                    <File className="h-16 w-16 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">{selectedFile?.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <SubmitButton isPending={isPending} />
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
