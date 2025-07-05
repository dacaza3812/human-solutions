"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

export async function submitContactForm(formData: FormData) {
  const supabase = createClient()

  const first_name = formData.get("first_name") as string
  const last_name = formData.get("last_name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const message = formData.get("message") as string
  const file = formData.get("file") as File | null

  if (!first_name || !last_name || !email || !message) {
    return { success: false, message: "Por favor, completa todos los campos obligatorios." }
  }

  let file_url: string | null = null

  if (file && file.size > 0) {
    const fileExtension = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = `inquiry-files/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("inquiry-files")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return { success: false, message: "Error al subir el archivo adjunto." }
    }

    const { data: publicUrlData } = supabase.storage.from("inquiry-files").getPublicUrl(filePath)
    file_url = publicUrlData.publicUrl
  }

  const { error } = await supabase.from("inquiries").insert({
    first_name,
    last_name,
    email,
    phone,
    message,
    file_url,
    status: "new", // Default status
  })

  if (error) {
    console.error("Error inserting inquiry:", error)
    return { success: false, message: "Error al enviar tu consulta. Por favor, inténtalo de nuevo." }
  }

  revalidatePath("/")
  return { success: true, message: "Tu consulta ha sido enviada exitosamente. ¡Gracias!" }
}
