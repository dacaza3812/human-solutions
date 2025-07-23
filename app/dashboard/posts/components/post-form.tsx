"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface PostFormProps {
  onSubmit: (data: any) => void
  initialData?: any
}

export default function PostForm({ onSubmit, initialData }: PostFormProps) {
  const [title, setTitle] = useState(initialData?.title || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [content, setContent] = useState(initialData?.content || "")
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "")
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const data = {
      title,
      description,
      content,
      image_url: imageUrl,
      published_at: new Date().toISOString(),
    }

    onSubmit(data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Editar Post" : "Crear Nuevo Post"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input type="text" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input
            type="text"
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Input
            type="url"
            placeholder="URL de la imagen de portada (opcional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <Textarea placeholder="Contenido" value={content} onChange={(e) => setContent(e.target.value)} required />
          <Button type="submit">{initialData ? "Guardar Cambios" : "Crear Post"}</Button>
        </form>
      </CardContent>
    </Card>
  )
}
