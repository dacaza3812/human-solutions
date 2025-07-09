"use server"

import { z } from "zod"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

const contactFormSchema = z.object({
    title: z.string().min(1, "El tema es requerido."),
    message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres."),
    file: z
        .instanceof(File)
        .optional()
        .refine((file) => {
            if (file) {
                // Max file size 5MB
                return file.size <= 5 * 1024 * 1024
            }
            return true
        }, "El archivo debe ser menor de 5MB."),
})

export async function submitContactForm2(prevState: any, formData: FormData) {

    const cookieStore = cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for server-side operations like storage uploads
        {
            cookies: {
                get: (name: string) => cookieStore.get(name)?.value,
                set: (name: string, value: string, options: any) => cookieStore.set(name, value, options),
                remove: (name: string) => cookieStore.delete(name), // Corrected the remove function
            },
        },
    )

    const parsed = contactFormSchema.safeParse({
        title: formData.get("title"),
        message: formData.get("message"),
        file: formData.get("file") instanceof File && formData.get("file")?.size > 0 ? formData.get("file") : undefined,
    })

    if (!parsed.success) {
        console.error("Validation errors:", parsed.error.flatten().fieldErrors)
        return {
            success: false,
            message: "Error de validación. Por favor, revisa los campos.",
            errors: parsed.error.flatten().fieldErrors,
        }
    }

    const { title, message, file } = parsed.data

    let fileUrl: string | null = null



    try {
        const { data: caseData, error: dbError } = await supabase.from("cases").insert({
            title,
            message,
            file_url: fileUrl,
            status: "pendiente",
        })
            .select()
            .single()


        if (dbError || !caseData) {
            console.error("Error inserting inquiry:", dbError)
            return {
                success: false,
                message: `Error al enviar el mensaje: ${dbError?.message}`,
                errors: {},
            }
        }

        const caseId = caseData.id

        if (file) {
            const fileExtension = file.name.split(".").pop()
            const filePath = `${uuidv4()}.${fileExtension}` // Generate a unique file name
            try {
                const { error: uploadError } = await supabase.storage
                    .from("case-files") // Ensure this bucket exists in Supabase Storage
                    .upload(filePath, file, {
                        cacheControl: "3600",
                        upsert: false,
                    })

                if (uploadError) {
                    console.error("Error uploading file:", uploadError)
                    return {
                        success: false,
                        message: `Error al subir el archivo: ${uploadError.message}`,
                        errors: {},
                    }
                }
                fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/case-files/${filePath}`

                await supabase.from("case_attachments").insert({
                    case_id: caseId,
                    bucket: "case-files",
                    path: filePath,
                    file_name: file.name,
                    file_size: file.size,
                    mime_type: file.type,
                })
                
            } catch (e) {
                console.error("Caught error during file upload:", e)
                return {
                    success: false,
                    message: "Error inesperado al subir el archivo.",
                    errors: {},
                }
            }
        }

        return {
            success: true,
            message: "¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.",
            errors: {},
        }
    } catch (e) {
        console.error("Caught error during database insertion:", e)
        return {
            success: false,
            message: "Error inesperado al enviar el mensaje.",
            errors: {},
        }
    }

}