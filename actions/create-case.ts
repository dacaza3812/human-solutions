"use server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

type CreateCaseParams = {
  userId: string
  title: string
  description: string
  files: File[]
}

export async function createCase({ userId, title, description, files }: CreateCaseParams) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: {
        get: name => cookieStore.get(name)?.value,
        set: (name, value, opts) => cookieStore.set(name, value, opts),
        remove: name => cookieStore.delete(name),
      }
    }
  )

  // 1) Insertar caso
  const { data: caseRow, error: caseError } = await supabase
    .from('cases')
    .insert({ user_id: userId, title, description })
    .select('id')
    .single()
  if (caseError || !caseRow) throw new Error(caseError?.message)
  const caseId = caseRow.id

  // 2) Subir archivos y registrar attachments
  if (files.length > 0) {
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const filename = `${uuidv4()}.${ext}`
      const path = `${caseId}/${filename}`
      const { error: upErr } = await supabase.storage
        .from('case-files')
        .upload(path, file)
      if (upErr) {
        console.error('Upload error:', upErr)
        continue
      }
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

  return caseRow
}