"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client" // Client-side Supabase client
import { useAuth } from "@/contexts/auth-context"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "El título debe tener al menos 2 caracteres.",
  }),
  description: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres.",
  }),
  // You might add file upload validation here if needed
})

export default function NewCaseForm() {
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  const [loading, setLoading] = useState(false)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)

    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear un caso.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    const { error } = await supabase.from("cases").insert({
      user_id: user.id,
      title: values.title,
      description: values.description,
      status: "pending", // Default status
    })

    if (error) {
      console.error("Error creating new case:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Caso creado",
        description: "Tu nuevo caso ha sido creado exitosamente.",
      })
      form.reset()
      // Optionally, close dialog or redirect
    }
    setLoading(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título del Caso</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Problema de herencia" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción Detallada</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe tu situación con el mayor detalle posible..." rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            "Crear Caso"
          )}
        </Button>
      </form>
    </Form>
  )
}
