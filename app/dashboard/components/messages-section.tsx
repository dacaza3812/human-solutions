"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendIcon, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns" // Import format from date-fns

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

interface Conversation {
  id: string
  participant1_id: string
  participant2_id: string
  last_message_at: string
  participant1_profile: {
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  } | null
  participant2_profile: {
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  } | null
}

export function MessagesSection() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const supabase = createClientComponentClient()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        fetchConversations(user.id)
      } else {
        setLoadingConversations(false)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId)
      // Set up real-time subscription for messages
      const channel = supabase
        .channel(`messages:${activeConversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${activeConversationId}`,
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
    }
  }, [activeConversationId, supabase])

  const fetchConversations = async (userId: string) => {
    setLoadingConversations(true)
    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        id,
        participant1_id,
        participant2_id,
        last_message_at,
        participant1_profile:participant1_id(first_name, last_name, avatar_url),
        participant2_profile:participant2_id(first_name, last_name, avatar_url)
      `,
      )
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order("last_message_at", { ascending: false })

    if (error) {
      console.error("Error fetching conversations:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las conversaciones.",
        variant: "destructive",
      })
    } else {
      setConversations(data as Conversation[])
      if (data.length > 0) {
        setActiveConversationId(data[0].id)
      }
    }
    setLoadingConversations(false)
  }

  const fetchMessages = async (conversationId: string) => {
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
    if (!newMessage.trim() || !activeConversationId || !currentUserId) return

    setIsSending(true)
    const { data: conversationData } = await supabase
      .from("conversations")
      .select("participant1_id, participant2_id")
      .eq("id", activeConversationId)
      .single()

    if (!conversationData) {
      toast({
        title: "Error",
        description: "Conversación no encontrada.",
        variant: "destructive",
      })
      setIsSending(false)
      return
    }

    const receiverId =
      conversationData.participant1_id === currentUserId
        ? conversationData.participant2_id
        : conversationData.participant1_id

    const { error } = await supabase.from("messages").insert({
      conversation_id: activeConversationId,
      sender_id: currentUserId,
      receiver_id: receiverId,
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
      // The real-time subscription will add the message to the state
      // Also update last_message_at for the conversation
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", activeConversationId)
      fetchConversations(currentUserId!) // Re-fetch conversations to update order
    }
    setIsSending(false)
  }

  const getParticipantInfo = (conversation: Conversation) => {
    if (!currentUserId) return { name: "Cargando...", avatar: "/placeholder-user.jpg" }
    if (conversation.participant1_id === currentUserId) {
      return {
        name: `${conversation.participant2_profile?.first_name || ""} ${conversation.participant2_profile?.last_name || ""}`,
        avatar: conversation.participant2_profile?.avatar_url || "/placeholder-user.jpg",
      }
    } else {
      return {
        name: `${conversation.participant1_profile?.first_name || ""} ${conversation.participant1_profile?.last_name || ""}`,
        avatar: conversation.participant1_profile?.avatar_url || "/placeholder-user.jpg",
      }
    }
  }

  if (loadingConversations) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle>Mensajes</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Cargando conversaciones...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Mensajes</CardTitle>
      </CardHeader>
      <CardContent className="flex h-[400px]">
        <div className="w-1/3 border-r pr-4 overflow-y-auto">
          <h3 className="font-semibold mb-4">Conversaciones</h3>
          {conversations.length === 0 ? (
            <p className="text-muted-foreground text-sm">No hay conversaciones.</p>
          ) : (
            conversations.map((conv) => {
              const participant = getParticipantInfo(conv)
              return (
                <div
                  key={conv.id}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer mb-2 ${
                    activeConversationId === conv.id ? "bg-muted" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setActiveConversationId(conv.id)}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={participant.name} />
                    <AvatarFallback>{participant.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{participant.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {conv.last_message_at ? format(new Date(conv.last_message_at), "HH:mm") : ""}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
        <div className="w-2/3 pl-4 flex flex-col">
          {activeConversationId ? (
            <>
              <div className="flex-1 overflow-y-auto mb-4 pr-2">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2">Cargando mensajes...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm">No hay mensajes en esta conversación.</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 mb-4 ${
                        msg.sender_id === currentUserId ? "justify-end" : "justify-start"
                      }`}
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
              </div>
              <div className="flex gap-2">
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
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Selecciona una conversación para empezar a chatear.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
