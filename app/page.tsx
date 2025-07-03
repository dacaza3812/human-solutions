"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useFormState, useFormStatus } from "react-dom"
import { submitContactForm } from "@/actions/contact"
import { toast } from "@/components/ui/use-toast"
import { CheckCircleIcon, XCircleIcon, Loader2, FileText } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enviando Mensaje...
        </>
      ) : (
        "Enviar Mensaje"
      )}
    </Button>
  )
}

export default function LandingPage() {
  const [state, formAction] = useFormState(submitContactForm, {
    success: false,
    message: "",
    errors: {},
  })
  const formRef = useRef<HTMLFormElement>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Éxito" : "Error",
        description: state.message,
        action: state.success ? (
          <CheckCircleIcon className="text-green-500" />
        ) : (
          <XCircleIcon className="text-red-500" />
        ),
      })
      if (state.success) {
        formRef.current?.reset()
        setFilePreview(null)
        setFileName(null)
      }
    }
  }, [state])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFileName(file.name)
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null) // Clear image preview for non-image files
      }
    } else {
      setFilePreview(null)
      setFileName(null)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <Image src="/fox-lawyer-logo.png" alt="Fox Lawyer Logo" width={40} height={40} />
          <span className="sr-only">Soluciones Humanas</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Servicios
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Nosotros
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Contacto
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Iniciar Sesión
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 sm:py-24 md:py-32 lg:py-48 xl:py-64 bg-gradient-to-r from-[#1a202c] to-[#2d3748] text-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Soluciones Legales Humanas y Efectivas
                  </h1>
                  <p className="max-w-[600px] text-gray-300 md:text-xl">
                    Ofrecemos asesoría legal experta con un enfoque humano, garantizando soluciones justas y eficientes
                    para cada caso.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    className="inline-flex h-10 items-center justify-center rounded-md bg-[#4299e1] px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-[#3182ce] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4299e1] disabled:pointer-events-none disabled:opacity-50"
                    href="/register"
                  >
                    Regístrate Ahora
                  </Link>
                  <Link
                    className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300"
                    href="#contact"
                  >
                    Contáctanos
                  </Link>
                </div>
              </div>
              <Image
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                height="550"
                src="/placeholder.svg?height=550&width=550"
                width="550"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-200 px-3 py-1 text-sm dark:bg-gray-700">
                  Nuestros Servicios
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Áreas de Especialización</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Ofrecemos una amplia gama de servicios legales para satisfacer tus necesidades.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="grid gap-1">
                <h3 className="text-lg font-bold">Derecho Familiar</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Asesoría en divorcios, custodia de menores, pensiones alimenticias y más.
                </p>
              </div>
              <div className="grid gap-1">
                <h3 className="text-lg font-bold">Derecho Laboral</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Defensa de derechos laborales, despidos injustificados, acoso laboral.
                </p>
              </div>
              <div className="grid gap-1">
                <h3 className="text-lg font-bold">Derecho Civil</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Contratos, propiedades, herencias, responsabilidad civil.
                </p>
              </div>
              <div className="grid gap-1">
                <h3 className="text-lg font-bold">Derecho Penal</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Defensa en casos penales, asesoría a víctimas y acusados.
                </p>
              </div>
              <div className="grid gap-1">
                <h3 className="text-lg font-bold">Derecho Mercantil</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Constitución de empresas, contratos mercantiles, litigios comerciales.
                </p>
              </div>
              <div className="grid gap-1">
                <h3 className="text-lg font-bold">Derecho Administrativo</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Recursos administrativos, licencias, permisos, sanciones.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32" id="about">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <Image
                alt="About Us"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                height="400"
                src="/placeholder.svg?height=400&width=600"
                width="600"
              />
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                    Sobre Nosotros
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    Comprometidos con la Justicia y la Humanidad
                  </h2>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                    En Soluciones Humanas, creemos que cada caso es único y merece una atención personalizada. Nuestro
                    equipo de abogados expertos está dedicado a brindarte el mejor apoyo legal con empatía y
                    profesionalismo.
                  </p>
                </div>
                <ul className="grid gap-2 py-4">
                  <li>
                    <CheckCircleIcon className="mr-2 inline-block h-4 w-4" />
                    Asesoría personalizada
                  </li>
                  <li>
                    <CheckCircleIcon className="mr-2 inline-block h-4 w-4" />
                    Experiencia comprobada
                  </li>
                  <li>
                    <CheckCircleIcon className="mr-2 inline-block h-4 w-4" />
                    Enfoque humano y ético
                  </li>
                </ul>
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md bg-[#4299e1] px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-[#3182ce] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4299e1] disabled:pointer-events-none disabled:opacity-50"
                  href="#"
                >
                  Conoce a Nuestro Equipo
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800" id="contact">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-200 px-3 py-1 text-sm dark:bg-gray-700">Contacto</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Envíanos un Mensaje</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  ¿Tienes alguna pregunta o necesitas asesoría? Completa el formulario y nos pondremos en contacto
                  contigo a la brevedad.
                </p>
              </div>
            </div>
            <div className="mx-auto w-full max-w-md py-12">
              <form ref={formRef} action={formAction} className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input id="firstName" name="firstName" placeholder="Tu nombre" required />
                    {state.errors?.firstName && <p className="text-red-500 text-sm">{state.errors.firstName[0]}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input id="lastName" name="lastName" placeholder="Tu apellido" required />
                    {state.errors?.lastName && <p className="text-red-500 text-sm">{state.errors.lastName[0]}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" name="email" placeholder="tu@ejemplo.com" type="email" required />
                  {state.errors?.email && <p className="text-red-500 text-sm">{state.errors.email[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono (Opcional)</Label>
                  <Input id="phone" name="phone" placeholder="123-456-7890" type="tel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    className="min-h-[100px]"
                    id="message"
                    name="message"
                    placeholder="Describe tu consulta..."
                    required
                  />
                  {state.errors?.message && <p className="text-red-500 text-sm">{state.errors.message[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Adjuntar Archivo (Opcional)</Label>
                  <Input id="file" name="file" type="file" onChange={handleFileChange} />
                  {state.errors?.file && <p className="text-red-500 text-sm">{state.errors.file[0]}</p>}
                  {filePreview && (
                    <div className="mt-2 p-2 border rounded-md flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                      {filePreview.startsWith("data:image/") ? (
                        <Image
                          src={filePreview || "/placeholder.svg"}
                          alt="File preview"
                          width={100}
                          height={100}
                          className="max-w-full h-auto object-contain"
                        />
                      ) : (
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <FileText className="mr-2 h-5 w-5" />
                          <span>{fileName}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {!filePreview && fileName && (
                    <div className="mt-2 p-2 border rounded-md flex items-center bg-gray-50 dark:bg-gray-700">
                      <FileText className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{fileName}</span>
                    </div>
                  )}
                </div>
                <SubmitButton />
              </form>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          &copy; 2024 Soluciones Humanas. Todos los derechos reservados.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Términos de Servicio
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  )
}
