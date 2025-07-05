"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase" // Client-side Supabase
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  profiles: {
    name: string | null
    avatar_url: string | null
  } | null
}

interface ChatInterfaceProps {
  caseId: string
}

export default function ChatInterface({ caseId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("messages")
        .select("*, profiles(name, avatar_url)")
        .eq("case_id", caseId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching messages:", error)
      } else {
        setMessages(data || [])
      }
      setLoading(false)
    }

    fetchMessages()

    // Realtime subscription
    const channel = supabase
      .channel(`case_chat_${caseId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `case_id=eq.${caseId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message
          // Fetch sender profile for the new message
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("name, avatar_url")
            .eq("id", newMessage.sender_id)
            .single()

          if (profileError) {
            console.error("Error fetching profile for new message:", profileError)
          }

          setMessages((prevMessages) => [...prevMessages, { ...newMessage, profiles: profileData || null }])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [caseId, supabase])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    setLoading(true)
    const { error } = await supabase.from("messages").insert({
      case_id: caseId,
      sender_id: user.id,
      content: newMessage,
    })

    if (error) {
      console.error("Error sending message:", error)
    } else {
      setNewMessage("")
    }
    setLoading(false)
  }

  return (
    <Card className="flex h-[600px] w-full flex-col">
      <CardHeader className="border-b">
        <CardTitle>Chat del Caso</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Sé el primero en enviar un mensaje.
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.sender_id === user?.id ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender_id !== user?.id && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.profiles?.avatar_url || "/placeholder-user.jpg"} />
                      <AvatarFallback>
                        {message.profiles?.name
                          ? message.profiles.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender_id === user?.id ? "bg-emerald-500 text-white" : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm font-medium">
                      {message.sender_id === user?.id ? "Tú" : message.profiles?.name || "Usuario Desconocido"}
                    </p>
                    <p className="text-sm">{message.content}</p>
                    <p className="mt-1 text-right text-xs opacity-70">
                      {format(new Date(message.created_at), "HH:mm", { locale: es })}
                    </p>
                  </div>
                  {message.sender_id === user?.id && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata.avatar_url || "/placeholder-user.jpg"} />
                      <AvatarFallback>
                        {user.user_metadata.name
                          ? user.user_metadata.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          <Input
            placeholder="Escribe tu mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
