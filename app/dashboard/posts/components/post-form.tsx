"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PostFormProps {
  onSubmit: (data: any) => void
  initialData?: any
}

export default function PostForm({ onSubmit, initialData }: PostFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    image_url: "",
    published_at: new Date().toISOString().slice(0, 16),
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        content: initialData.content || "",
        image_url: initialData.image_url || "",
        published_at: initialData.published_at
          ? new Date(initialData.published_at).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
      })
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      published_at: new Date(formData.published_at).toISOString(),
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{initialData ? "Editar Post" : "Crear Nuevo Post"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="content">Contenido</Label>
            <Textarea id="content" name="content" value={formData.content} onChange={handleChange} rows={10} required />
          </div>

          <div>
            <Label htmlFor="image_url">URL de Imagen (opcional)</Label>
            <Input id="image_url" name="image_url" type="url" value={formData.image_url} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="published_at">Fecha de Publicación</Label>
            <Input
              id="published_at"
              name="published_at"
              type="datetime-local"
              value={formData.published_at}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">{initialData ? "Actualizar Post" : "Crear Post"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
