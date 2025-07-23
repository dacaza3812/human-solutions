"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface BlogPostProps {
  params: { id: string }
}

export default function BlogPost({ params }: BlogPostProps) {
  const { id } = params
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user, profile } = useAuth()
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).single()

        if (error) {
          console.error("Error fetching post:", error)
        } else {
          setPost(data)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  useEffect(() => {
    if (profile) {
      setIsSubscribed(profile.subscription_status === "active")
    }
  }, [profile])

  if (loading) {
    return <div>Cargando post...</div>
  }

  if (!post) {
    return <div>Post no encontrado</div>
  }

  const truncatedContent =
    !isSubscribed && post.content ? post.content.substring(0, post.content.length / 2) : post.content
  const isContentTruncated = !isSubscribed && post.content && post.content.length > truncatedContent.length

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>{post.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{post.description}</p>
          <div className="mt-4 relative">
            {truncatedContent}
            {isContentTruncated && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background blur-md flex items-center justify-center">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center">
                    <p className="text-lg font-semibold">Suscríbete para leer el artículo completo</p>
                    <Button asChild>
                      <Link href="/subscriptions">Ver Suscripciones</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-between items-center">
            <div>
              Autor: {post.author_id}, Publicado: {post.published_at}
            </div>
            <div className="space-x-2">
              <Button asChild>
                <Link href="#">Compartir en Facebook</Link>
              </Button>
              <Button asChild>
                <Link href="#">Compartir en Twitter</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
