"use server"

import { supabaseServer } from "@/lib/supabase-server" // Corrected import
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

interface FormState {
  success: boolean
  message: string
  errors?: {
    firstName?: string[]
    lastName?: string[]
    email?: string[]
    phone?: string[]
    message?: string[]
    file?: string[]
  }
}

export async function submitContactForm(prevState: FormState, formData: FormData): Promise<FormState> {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const message = formData.get("message") as string
  const file = formData.get("file") as File | null

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
  if (file && file.size > 0) {
    const fileExtension = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = `inquiries/${fileName}`

    // Use supabaseServer for privileged operations like file uploads
    const { data: uploadData, error: uploadError } = await supabaseServer.storage
      .from("inquiry-files") // Ensure this bucket exists in your Supabase project
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return { success: false, message: `Error al subir el archivo: ${uploadError.message}` }
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabaseServer.storage.from("inquiry-files").getPublicUrl(filePath)
    fileUrl = publicUrlData.publicUrl
  }

  try {
    const { data, error } = await supabaseServer.from("inquiries").insert({
      // Use supabaseServer here too
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || null,
      message,
      file_url: fileUrl,
      status: "new", // Default status
    })

    if (error) {
      console.error("Error inserting inquiry:", error)
      return { success: false, message: `Error al enviar el formulario: ${error.message}` }
    }

    revalidatePath("/") // Revalidate the landing page if needed
    revalidatePath("/dashboard/inquiries") // Revalidate the new dashboard section

    return { success: true, message: "¡Tu mensaje ha sido enviado exitosamente! Nos pondremos en contacto pronto." }
  } catch (e: any) {
    console.error("Unexpected error:", e)
    return { success: false, message: `Ocurrió un error inesperado: ${e.message}` }
  }
}
