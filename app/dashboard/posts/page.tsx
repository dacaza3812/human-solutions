"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import PostForm from "./components/post-form"
import { useToast } from "@/hooks/use-toast"

interface BlogPost {
  id: string
  title: string
  description: string
  content: string
  image_url: string
  published_at: string
  created_at: string
  author_id: string
}

export default function BlogPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const { profile } = useAuth()
  const { toast } = useToast()

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("author_id", profile?.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching posts:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los posts. Asegúrate de que la tabla blog_posts existe.",
          variant: "destructive",
        })
      } else {
        setPosts(data || [])
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast({
        title: "Error",
        description: "Error inesperado al cargar los posts.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (profile?.account_type === "advisor") {
      fetchPosts()
    } else {
      setLoading(false)
    }
  }, [profile])

  const handleCreatePost = () => {
    setSelectedPost(null)
    setShowForm(true)
  }

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post)
    setShowForm(true)
  }

  const handleDeletePost = async (postId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este post?")) {
      try {
        setLoading(true)
        const { error } = await supabase.from("blog_posts").delete().eq("id", postId)

        if (error) {
          console.error("Error deleting post:", error)
          toast({
            title: "Error",
            description: "No se pudo eliminar el post.",
            variant: "destructive",
          })
        } else {
          setPosts(posts.filter((post) => post.id !== postId))
          toast({
            title: "Éxito",
            description: "Post eliminado correctamente.",
          })
        }
      } catch (error) {
        console.error("Unexpected error deleting post:", error)
        toast({
          title: "Error",
          description: "Error inesperado al eliminar el post.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleFormSubmit = async (data: Omit<BlogPost, "id" | "created_at" | "author_id">) => {
    try {
      setLoading(true)
      const { error } = selectedPost
        ? await supabase.from("blog_posts").update(data).eq("id", selectedPost.id)
        : await supabase.from("blog_posts").insert([{ ...data, author_id: profile?.id }])

      if (error) {
        console.error("Error saving post:", error)
        toast({
          title: "Error",
          description: "No se pudo guardar el post.",
          variant: "destructive",
        })
      } else {
        fetchPosts()
        setShowForm(false)
        toast({
          title: "Éxito",
          description: "Post guardado correctamente.",
        })
      }
    } catch (error) {
      console.error("Unexpected error saving post:", error)
      toast({
        title: "Error",
        description: "Error inesperado al guardar el post.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (profile?.account_type !== "advisor") {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Acceso Restringido</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Solo los asesores pueden administrar los posts del blog.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Administración de Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Button onClick={handleCreatePost}>Crear Nuevo Post</Button>
          </div>

          {showForm && <PostForm onSubmit={handleFormSubmit} initialData={selectedPost} />}

          {loading ? (
            <div className="text-center py-8">Cargando posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No tienes posts creados aún.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Fecha de Publicación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell className="max-w-xs truncate">{post.description}</TableCell>
                    <TableCell>{new Date(post.published_at).toLocaleDateString("es-ES")}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditPost(post)}>
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeletePost(post.id)}>
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
