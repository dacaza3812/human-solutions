"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import PostForm from './components/post-form';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

export default function BlogPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
      } else {
        setPosts(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = () => {
    setSelectedPost(null);
    setShowForm(true);
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setShowForm(true);
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este post?")) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', postId);

        if (error) {
          console.error("Error deleting post:", error);
          toast({
            title: "Error",
            description: "Failed to delete post.",
            variant: "destructive",
          });
        } else {
          setPosts(posts.filter(post => post.id !== postId));
          toast({
            title: "Success",
            description: "Post deleted successfully.",
          });
        }
      } catch (error) {
        console.error("Unexpected error deleting post:", error);
        toast({
          title: "Error",
          description: "Unexpected error deleting post.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      setLoading(true);
      const { error } = selectedPost
        ? await supabase
          .from('blog_posts')
          .update(data)
          .eq('id', selectedPost.id)
        : await supabase
          .from('blog_posts')
          .insert([{ ...data, id: uuidv4(), author_id: profile?.id }]);

      if (error) {
        console.error("Error saving post:", error);
        toast({
          title: "Error",
          description: "Failed to save post.",
          variant: "destructive",
        });
      } else {
        fetchPosts(); // Refresh posts after saving
        setShowForm(false);
        toast({
          title: "Success",
          description: "Post saved successfully.",
        });
      }
    } catch (error) {
      console.error("Unexpected error saving post:", error);
      toast({
          title: "Error",
          description: "Unexpected error saving post.",
          variant: "destructive",
        });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Administración de Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {profile?.account_type === "advisor" ? (
            <div>
              <Button onClick={handleCreatePost}>Crear Nuevo Post</Button>
              {showForm && (
                <PostForm
                  onSubmit={handleFormSubmit}
                  initialData={selectedPost}
                />
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Título</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Fecha de Publicación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>{post.description}</TableCell>
                      <TableCell>{post.published_at}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="secondary" size="sm" onClick={() => handleEditPost(post)}>Editar</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeletePost(post.id)}>Eliminar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div>
              Solo los asesores pueden administrar los posts.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
