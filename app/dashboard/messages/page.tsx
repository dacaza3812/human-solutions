"use client"

import { CardFooter } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MessageCircle, Send } from "lucide-react"
import { useSearchParams } from "next/navigation"

interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
  is_read: boolean
}

interface Conversation {
  id: string
  participant: string
  last_message: string
  last_message_time: string
  unread_count: number
}

export default function MessagesPage() {
  const { profile, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const initialCaseId = searchParams.get("case")

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && profile) {
      fetchConversations()
    }
  }, [profile, authLoading])

  useEffect(() => {
    if (initialCaseId && conversations.length > 0) {
      // Find conversation related to the initialCaseId, if applicable
      // For now, just select the first one or a mock one
      const mockConversation = conversations.find((conv) => conv.id === initialCaseId) || conversations[0]
      if (mockConversation) {
        setSelectedConversation(mockConversation)
        fetchMessages(mockConversation.id)
      }
    } else if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0])
      fetchMessages(conversations[0].id)
    }
  }, [initialCaseId, conversations, selectedConversation]) // Added selectedConversation to dependencies

  const fetchConversations = async () => {
    setLoading(true)
    setError(null)
    try {
      // Simulate fetching conversations
      if (profile?.account_type === "advisor") {
        setConversations([
          {
            id: "conv1",
            participant: "Juan Pérez",
            last_message: "Revisando los documentos...",
            last_message_time: "10:30 AM",
            unread_count: 2,
          },
          {
            id: "conv2",
            participant: "Ana López",
            last_message: "Necesito una cita urgente.",
            last_message_time: "Ayer",
            unread_count: 0,
          },
        ])
      } else {
        setConversations([
          {
            id: "conv3",
            participant: "Dr. Smith",
            last_message: "Su caso está en progreso.",
            last_message_time: "11:00 AM",
            unread_count: 1,
          },
          {
            id: "conv4",
            participant: "Dra. García",
            last_message: "Adjunto la cotización.",
            last_message_time: "Hace 2 días",
            unread_count: 0,
          },
        ])
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err)
      setError("No se pudieron cargar las conversaciones.")
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    // Simulate fetching messages for a specific conversation
    setMessages([
      { id: "msg1", sender: "Participant", content: "Hola, ¿cómo va mi caso?", timestamp: "10:00 AM", is_read: true },
      {
        id: "msg2",
        sender: "Me",
        content: "Hola, estoy revisando los documentos. Te actualizo pronto.",
        timestamp: "10:05 AM",
        is_read: true,
      },
      { id: "msg3", sender: "Participant", content: "De acuerdo, gracias.", timestamp: "10:10 AM", is_read: false },
    ])
  }

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const newMsg: Message = {
        id: Date.now().toString(),
        sender: "Me", // Assuming "Me" is the current user
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        is_read: false, // Mark as unread for the other party
      }
      setMessages((prevMessages) => [...prevMessages, newMsg])
      setNewMessage("")
      // In a real app, send message to backend here
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
      {/* Conversation List */}
      <Card className="lg:col-span-1 flex flex-col">
        <CardHeader>
          <CardTitle>Mensajes</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay conversaciones.</div>
          ) : (
            <nav className="grid gap-1 p-2">
              {conversations.map((conv) => (
                <Button
                  key={conv.id}
                  variant="ghost"
                  className={`justify-start h-auto py-3 ${selectedConversation?.id === conv.id ? "bg-muted" : ""}`}
                  onClick={() => {
                    setSelectedConversation(conv)
                    fetchMessages(conv.id)
                  }}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">{conv.participant}</span>
                    <span className="text-sm text-muted-foreground truncate w-full">{conv.last_message}</span>
                    <span className="text-xs text-muted-foreground">{conv.last_message_time}</span>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="ml-auto px-2 py-1 text-xs font-bold bg-emerald-500 text-white rounded-full">
                      {conv.unread_count}
                    </span>
                  )}
                </Button>
              ))}
            </nav>
          )}
        </CardContent>
      </Card>

      {/* Message View */}
      <Card className="lg:col-span-2 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle>
            {selectedConversation ? selectedConversation.participant : "Selecciona una conversación"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedConversation ? (
            messages.length === 0 ? (
              <div className="text-center text-muted-foreground">No hay mensajes en esta conversación.</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "Me" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender === "Me" ? "bg-emerald-500 text-white" : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-xs opacity-75 mt-1 block text-right">{msg.timestamp}</span>
                  </div>
                </div>
              ))
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageCircle className="w-16 h-16 mb-4" />
              <p className="text-lg">Inicia una conversación</p>
            </div>
          )}
        </CardContent>
        {selectedConversation && (
          <CardFooter className="border-t p-4">
            <div className="flex w-full space-x-2">
              <Input
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage()
                  }
                }}
              />
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Enviar</span>
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
