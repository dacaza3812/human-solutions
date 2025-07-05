"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase-server"
import { v4 as uuidv4 } from "uuid"

const contactFormSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido."),
  lastName: z.string().min(1, "El apellido es requerido."),
  email: z.string().email("Correo electrónico inválido."),
  phone: z.string().optional(),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres."),
  file: z.instanceof(File).optional(),
})

export async function submitContactForm(prevState: any, formData: FormData) {
  const supabase = createClient()

  const validatedFields = contactFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
    file: formData.get("file") instanceof File && formData.get("file")?.size > 0 ? formData.get("file") : undefined,
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Error de validación. Por favor, revisa los campos.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { firstName, lastName, email, phone, message, file } = validatedFields.data
  let fileUrl: string | null = null

  if (file) {
    const fileExtension = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    const { data, error: uploadError } = await supabase.storage
      .from("contact-form-attachments")
      .upload(fileName, file, {
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
    fileUrl = data.path
  }

  const { error: dbError } = await supabase.from("inquiries").insert([
    {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      message,
      attachment_url: fileUrl,
      status: "pending",
    },
  ])

  if (dbError) {
    console.error("Error inserting into database:", dbError)
    return {
      success: false,
      message: "Error al enviar el formulario. Por favor, inténtalo de nuevo.",
      errors: { general: ["Error al guardar la consulta."] },
    }
  }

  return {
    success: true,
    message: "¡Tu mensaje ha sido enviado con éxito! Nos pondremos en contacto contigo pronto.",
    errors: {},
  }
}
