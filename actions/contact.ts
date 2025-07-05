"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

const contactFormSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido."),
  lastName: z.string().min(1, "El apellido es requerido."),
  email: z.string().email("Correo electrónico inválido.").min(1, "El correo electrónico es requerido."),
  phone: z.string().optional(),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres."),
  file: z.any().optional(), // File will be handled separately
})

export async function submitContactForm(prevState: any, formData: FormData) {
  const supabase = createClient()

  const data = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
    file: formData.get("file"),
  }

  const validatedFields = contactFormSchema.safeParse(data)

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Error de validación. Por favor, revisa los campos.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  let fileUrl: string | null = null
  const file = validatedFields.data.file

  if (file instanceof File && file.size > 0) {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("contact_form_files")
      .upload(`${Date.now()}-${file.name}`, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return {
        success: false,
        message: "Error al subir el archivo. Inténtalo de nuevo.",
        errors: { file: ["Error al subir el archivo."] },
      }
    }
    fileUrl = uploadData.path
  }

  const { error } = await supabase.from("inquiries").insert({
    first_name: validatedFields.data.firstName,
    last_name: validatedFields.data.lastName,
    email: validatedFields.data.email,
    phone: validatedFields.data.phone,
    message: validatedFields.data.message,
    file_url: fileUrl,
    status: "pending", // Default status
  })

  if (error) {
    console.error("Error inserting inquiry:", error)
    return {
      success: false,
      message: "Error al enviar el formulario. Inténtalo de nuevo.",
      errors: { general: ["Error al enviar el formulario."] },
    }
  }

  revalidatePath("/dashboard/inquiries") // Revalidate inquiries page to show new entry

  return {
    success: true,
    message: "¡Formulario enviado con éxito! Nos pondremos en contacto pronto.",
  }
}

export async function updateInquiryStatus(inquiryId: string, newStatus: string) {
  const supabase = createClient()
  const { error } = await supabase.from("inquiries").update({ status: newStatus }).eq("id", inquiryId)

  if (error) {
    console.error("Error updating inquiry status:", error)
    return { success: false, message: "Error al actualizar el estado de la consulta." }
  }

  revalidatePath("/dashboard/inquiries")
  return { success: true, message: "Estado de la consulta actualizado con éxito." }
}
