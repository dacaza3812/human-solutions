"use client"

import type React from "react"

import { useEffect, useRef, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { File, Loader2, Upload, XCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { submitContactForm } from "@/actions/contact"
import Image from "next/image"
import { submitContactForm2 } from "@/actions/createcase2"

export default function NewCaseForm() {
    const [consultationType, setConsultationType] = useState("")
    const [clientName, setClientName] = useState("")
    const [clientEmail, setClientEmail] = useState("")
    const [clientPhone, setClientPhone] = useState("")
    const [priorityLevel, setPriorityLevel] = useState("")
    const [description, setDescription] = useState("")
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const contactFormRef = useRef<HTMLFormElement>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)
    const { profile } = useAuth()
    const { toast } = useToast()

    

    function SubmitButton({ isPending }: { isPending: boolean }) {
        const text = profile?.subscription_status === "active" ? "Crear Nuevo Caso" : "Crear Nuevo Caso (Solo para suscriptores)"
        const isDisabled = profile?.subscription_status !== "active" && !isPending
        return (
            <Button type="submit" disabled={isDisabled} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                {isPending ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                    </>
                ) : (
                    text
                )}
            </Button>
        )
    }

    const [isPending, startTransition] = useTransition()
    const [formState, setFormState] = useState({
        success: false,
        message: "",
        errors: {},
    })

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
        const result = await submitContactForm2(formState, formData) // Pass prevState as first argument
        startTransition(() => {
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
        <form ref={contactFormRef} action={handleContactFormSubmit} className="space-y-6 p-4">
            <div className="grid gap-4">
                {/* Consultation Type */}
                {/* <div className="space-y-2">
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
        </div> */}

                {/* Contact Information */}
                {/* <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700"> */}
                <Card className=" ">
                    <CardHeader>
                        <CardTitle className="text-lg">Datos de Contacto</CardTitle>
                        <CardDescription>Información del cliente para el caso.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">

                        <div className="space-y-2">
                            <Label htmlFor="client-title">Tema del caso</Label>
                            <Input id="title" name="title" type="text" placeholder="Asesoría financiera" className="mt-1" />
                            {formState.errors?.title && (
                                <p className="text-red-500 text-sm mt-1">{formState.errors.title[0]}</p>
                            )}
                        </div>
                        {/*<div className="space-y-2">
                            <Label htmlFor="client-phone">Número de Teléfono</Label>
                            <Input id="phone" name="phone" type="tel" placeholder="+52 123 456 7890" className="mt-1" />
                            {formState.errors?.phone && (
                                <p className="text-red-500 text-sm mt-1">{formState.errors.phone[0]}</p>
                            )}
                        </div> */}

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="message"
                                name="message"
                                placeholder="Cuéntanos sobre tu situación y objetivos..."
                                rows={4}
                                className="mt-1"
                            />
                            {formState.errors?.message && (
                                <p className="text-red-500 text-sm mt-1">{formState.errors.message[0]}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Priority Level */}
                {/* <div className="space-y-2">
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
        </div> */}

                {/* Description */}
               {/* <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                        id="message"
                        name="message"
                        placeholder="Cuéntanos sobre tu situación y objetivos..."
                        rows={4}
                        className="mt-1"
                    />
                    {formState.errors?.message && (
                        <p className="text-red-500 text-sm mt-1">{formState.errors.message[0]}</p>
                    )}
                </div> */}

                {/* Image Upload */}
                <div className="space-y-2">
                    <Label htmlFor="images">Imágenes (Opcional)</Label>
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
                        {formState.errors?.file && (
                            <p className="text-red-500 text-sm mt-1">{formState.errors.file[0]}</p>
                        )}
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
            </div>



            <div className="flex flex-col sm:flex-row gap-4">
                <SubmitButton isPending={isPending} />
            </div>
        </form>
    )
}
