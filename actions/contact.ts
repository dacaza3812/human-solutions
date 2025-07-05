"use server"

import { z } from "zod"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase-server" // Import the server-side client

const resend = new Resend(process.env.RESEND_API_KEY)

const contactFormSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido."),
  lastName: z.string().min(1, "El apellido es requerido."),
  email: z.string().email("Correo electrónico inválido."),
  phone: z.string().optional(),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres."),
  file: z.any().optional(), // Will be validated separately if needed
})

export async function submitContactForm(
  prevState: { success: boolean; message: string; errors?: Record<string, string[]> },
  formData: FormData,
) {
  const validatedFields = contactFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
    file: formData.get("file"),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Error de validación. Por favor, revisa los campos.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { firstName, lastName, email, phone, message, file } = validatedFields.data

  try {
    const supabase = await createClient() // FIX: Await the creation of the Supabase client
    let fileUrl: string | null = null

    if (file instanceof File && file.size > 0) {
      const { data, error: uploadError } = await supabase.storage
        .from("inquiry-files") // Ensure this bucket exists in your Supabase project
        .upload(`${Date.now()}-${file.name}`, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.error("Error uploading file:", uploadError)
        return {
          success: false,
          message: "Error al subir el archivo. Por favor, inténtalo de nuevo.",
        }
      }
      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage.from("inquiry-files").getPublicUrl(data.path)
      fileUrl = publicUrlData.publicUrl
    }

    const { error: dbError } = await supabase.from("inquiries").insert({
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone || null,
      message: message,
      file_url: fileUrl,
      status: "new", // Default status
    })

    if (dbError) {
      console.error("Error inserting inquiry:", dbError)
      return {
        success: false,
        message: "Error al guardar tu consulta. Por favor, inténtalo de nuevo.",
      }
    }

    // Send email notification
    await resend.emails.send({
      from: "onboarding@resend.dev", // Replace with your verified sender
      to: "delivered@resend.dev", // Replace with your recipient email
      subject: "Nueva Consulta de Contacto de Fox Lawyer",
      html: `
        <p><strong>Nombre:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${phone || "N/A"}</p>
        <p><strong>Mensaje:</strong> ${message}</p>
        ${fileUrl ? `<p><strong>Archivo Adjunto:</strong> <a href="${fileUrl}">${file.name}</a></p>` : ""}
      `,
    })

    return {
      success: true,
      message: "Tu mensaje ha sido enviado con éxito. Nos pondremos en contacto contigo pronto.",
    }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return {
      success: false,
      message: `Ocurrió un error inesperado: ${error.message}`,
    }
  }
}
