"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

const contactFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  email: z.string().email("Correo electrónico inválido."),
  phone: z.string().optional(),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres."),
  file: z.instanceof(File).optional(),
})

export async function submitContactForm(prevState: any, formData: FormData) {
  const supabase = createClient()

  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
    file: formData.get("file"),
  }

  const parsed = contactFormSchema.safeParse(data)

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    return {
      success: false,
      message: "Error de validación. Por favor, revisa los campos.",
      errors: errors,
    }
  }

  const { name, email, phone, message, file } = parsed.data

  let fileUrl: string | null = null
  if (file) {
    const filePath = `inquiries/${email}/${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage.from("inquiries").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return {
        success: false,
        message: "Error al subir el archivo. Por favor, inténtalo de nuevo.",
        errors: { file: ["Error al subir el archivo."] },
      }
    }
    fileUrl = uploadData.path
  }

  const { error } = await supabase.from("inquiries").insert({
    name,
    email,
    phone,
    message,
    file_url: fileUrl,
  })

  if (error) {
    console.error("Error inserting inquiry:", error)
    return {
      success: false,
      message: "Error al enviar el mensaje. Por favor, inténtalo de nuevo.",
      errors: { general: ["Error al enviar el mensaje."] },
    }
  }

  revalidatePath("/")
  return {
    success: true,
    message: "¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.",
    errors: {},
  }
}
