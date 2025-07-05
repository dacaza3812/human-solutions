"use client"

import { useState, useEffect, useRef } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendIcon, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  sender_profile: {
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  } | null
}

interface ChatInterfaceProps {
  conversationId: string
  currentUserId: string
  otherParticipantProfile: {
    id: string
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  }
}

export function ChatInterface({ conversationId, currentUserId, otherParticipantProfile }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const supabase = createClientComponentClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages((prevMessages) => [...prevMessages, newMessage])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchMessages = async () => {
    setLoadingMessages(true)
    const { data, error } = await supabase
      .from("messages")
      .select(
        `
        id,
        sender_id,
        receiver_id,
        content,
        created_at,
        sender_profile:sender_id(first_name, last_name, avatar_url)
      `,
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes.",
        variant: "destructive",
      })
    } else {
      setMessages(data as Message[])
    }
    setLoadingMessages(false)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setIsSending(true)
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      receiver_id: otherParticipantProfile.id,
      content: newMessage,
    })

    if (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje.",
        variant: "destructive",
      })
    } else {
      setNewMessage("")
      // Update last_message_at for the conversation
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId)
    }
    setIsSending(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 border-b p-4">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={otherParticipantProfile.avatar_url || "/placeholder-user.jpg"}
            alt={otherParticipantProfile.first_name || "User"}
          />
          <AvatarFallback>
            {otherParticipantProfile.first_name ? otherParticipantProfile.first_name[0] : "U"}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold">
          {otherParticipantProfile.first_name} {otherParticipantProfile.last_name}
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Cargando mensajes...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">Empieza una conversación.</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
            >
              {msg.sender_id !== currentUserId && (
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={msg.sender_profile?.avatar_url || "/placeholder-user.jpg"}
                    alt={msg.sender_profile?.first_name || "User"}
                  />
                  <AvatarFallback>
                    {msg.sender_profile?.first_name ? msg.sender_profile.first_name[0] : "U"}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  msg.sender_id === currentUserId
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted text-muted-foreground rounded-bl-none"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <span className="block text-xs text-right mt-1 opacity-70">
                  {format(new Date(msg.created_at), "HH:mm")}
                </span>
              </div>
              {msg.sender_id === currentUserId && (
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={msg.sender_profile?.avatar_url || "/placeholder-user.jpg"}
                    alt={msg.sender_profile?.first_name || "User"}
                  />
                  <AvatarFallback>
                    {msg.sender_profile?.first_name ? msg.sender_profile.first_name[0] : "U"}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2 p-4 border-t">
        <Input
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSendMessage()
            }
          }}
          disabled={isSending}
        />
        <Button onClick={handleSendMessage} disabled={isSending}>
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
          <span className="sr-only">Enviar</span>
        </Button>
      </div>
    </div>
  )
}
