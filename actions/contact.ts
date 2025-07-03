"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

interface FormState {
  success: boolean
  message: string
  errors?: {
    firstName?: string[]
    lastName?: string[]
    email?: string[]
    phone?: string[]
    serviceArea?: string[]
    priority?: string[]
    message?: string[]
    file?: string[]
  }
}

export async function submitContactForm(prevState: FormState, formData: FormData): Promise<FormState> {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const serviceArea = formData.get("serviceArea") as string
  const priority = formData.get("priority") as string
  const message = formData.get("message") as string
  const file = formData.get("file") as File | null // Handle file input

  const errors: FormState["errors"] = {}

  if (!firstName || firstName.trim() === "") {
    errors.firstName = ["El nombre es requerido."]
  }
  if (!lastName || lastName.trim() === "") {
    errors.lastName = ["El apellido es requerido."]
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = ["El correo electrónico es inválido."]
  }
  if (!message || message.trim() === "") {
    errors.message = ["El mensaje es requerido."]
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, message: "Por favor, corrige los errores en el formulario.", errors }
  }

  let fileUrl: string | null = null
  // NOTE: For a real application, you would upload the file to a storage service
  // like Vercel Blob or Supabase Storage here and get a public URL.
  // For this example, we'll just store a placeholder if a file was provided.
  if (file && file.size > 0) {
    // In a real scenario, you'd upload the file and get its URL
    // Example: const { data, error: uploadError } = await supabase.storage.from('inquiry-files').upload(...)
    // For now, we'll just indicate a file was present.
    fileUrl = `placeholder-file-url/${file.name}`
  }

  try {
    const { data, error } = await supabase.from("inquiries").insert({
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || null,
      service_area: serviceArea || null,
      priority: priority || null,
      message,
      file_url: fileUrl,
      status: "new", // Default status
    })

    if (error) {
      console.error("Error inserting inquiry:", error)
      return { success: false, message: `Error al enviar el formulario: ${error.message}` }
    }

    revalidatePath("/") // Revalidate the landing page if needed
    revalidatePath("/dashboard/contactos") // Revalidate the new dashboard section

    return { success: true, message: "¡Tu mensaje ha sido enviado exitosamente! Nos pondremos en contacto pronto." }
  } catch (e: any) {
    console.error("Unexpected error:", e)
    return { success: false, message: `Ocurrió un error inesperado: ${e.message}` }
  }
}
