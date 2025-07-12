// actions/createcase2.ts
"use server"
import { z } from "zod"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

// Validamos exactamente los campos del formulario
const caseFormSchema = z.object({
  title: z.string().min(1, "El tema es requerido."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  file: z
    .instanceof(File)
    .optional()
    .refine((f) => (f ? f.size <= 5 * 1024 * 1024 : true), "El archivo debe ser menor de 5MB."),
})

export async function submitCreateCase(formData: FormData, userId: string) {
  // Inicializa supabase con service role para saltar RLS
  console.log(userId)
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: (n) => cookieStore.get(n)?.value,
        set: (n, v, o) => cookieStore.set(n, v, o),
        remove: (n) => cookieStore.delete(n),
      },
    }
  )

  // 1) Extrae el usuario actual
  // const {
  //   data: { user },
  //   error: authErr,
  // } = await supabase.auth.getUser()
  // if (authErr || !user) {
  //   throw new Error("No has iniciado sesión.")
  // }

  // 2) Parseamos y validamos
  const parsed = caseFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    file: formData.get("file") instanceof File ? formData.get("file") : undefined,
  })
  if (!parsed.success) {
    const errs = parsed.error.flatten().fieldErrors
    throw new Error("Validación: " + JSON.stringify(errs))
  }
  const { title, description, file } = parsed.data

  // 3) Creamos el caso con user_id y description (no message ni file_url)
  const { data: caseRow, error: caseErr } = await supabase
    .from("cases")
    .insert({
      user_id: userId,
      title,
      description,
      status: "pendiente",
    })
    .select("id")
    .single()

  if (caseErr || !caseRow) {
    throw new Error("Error creando caso: " + caseErr?.message)
  }
  const caseId = caseRow.id

  // 4) Si hay archivo, súbelo y registra el attachment
  if (file) {
    const ext = file.name.split('.').pop()
    const filename = `${uuidv4()}.${ext}`
    const path = `${caseId}.${filename}`
    const { error: upErr } = await supabase.storage
      .from('case-files')
      .upload(path, file)
    if (upErr) {
      console.error('Upload error:', upErr)
    } else {
      await supabase.from('case_attachments').insert({
        case_id: caseId,
        bucket: 'case-files',
        path,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
      })
    }
  }

  return { success: true, caseId }
}
