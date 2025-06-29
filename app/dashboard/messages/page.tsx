"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, XCircle, FileText } from "lucide-react"
import { useSearchParams } from "next/navigation"

interface Message {
  id: string
  sender: "me" | "other"
  content: string
  timestamp: string
}

interface Conversation {
  id: string
  participantName: string
  lastMessage: string
  lastMessageTime: string
  messages: Message[]
}

const mockConversations: Conversation[] = [
  {
    id: "conv1",
    participantName: "Lic. Juan Pérez",
    lastMessage: "Revisando los documentos del caso.",
    lastMessageTime: "10:30 AM",
    messages: [
      { id: "m1", sender: "other", content: "Hola, ¿cómo va mi caso de divorcio?", timestamp: "10:00 AM" },
      {
        id: "m2",
        sender: "me",
        content: "Hola, estoy revisando los documentos. Te actualizo pronto.",
        timestamp: "10:05 AM",
      },
      { id: "m3", sender: "other", content: "Perfecto, gracias.", timestamp: "10:10 AM" },
      { id: "m4", sender: "other", content: "Revisando los documentos del caso.", timestamp: "10:30 AM" },
    ],
  },
  {
    id: "conv2",
    participantName: "Ana García",
    lastMessage: "Necesito una consulta sobre herencia.",
    lastMessageTime: "Ayer",
    messages: [
      { id: "m5", sender: "other", content: "Hola, necesito una consulta sobre herencia.", timestamp: "Ayer 03:00 PM" },
      { id: "m6", sender: "me", content: "Claro, ¿cuándo te viene bien?", timestamp: "Ayer 03:05 PM" },
    ],
  },
  {
    id: "conv3",
    participantName: "Tech Innovators S.A.",
    lastMessage: "Contrato de servicios listo para revisión.",
    lastMessageTime: "23/10/2023",
    messages: [
      { id: "m7", sender: "other", content: "Contrato de servicios listo para revisión.", timestamp: "23/10/2023" },
    ],
  },
]

export default function MessagesPage() {
  const { profile, loading } = useAuth()
  const searchParams = useSearchParams()
  const caseId = searchParams.get("case")

  const [conversations, setConversations] = useState<Conversation[]>(mockConversations)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // If a caseId is provided, try to select a conversation related to it
    if (caseId) {
      // In a real app, you'd fetch conversations related to this caseId
      // For now, we'll just select the first conversation as a placeholder
      if (conversations.length > 0) {
        setSelectedConversationId(conversations[0].id)
      }
    } else if (!selectedConversationId && conversations.length > 0) {
      // Select the first conversation by default if no caseId and no conversation selected
      setSelectedConversationId(conversations[0].id)
    }
  }, [caseId, conversations, selectedConversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selectedConversationId, conversations]) // Scroll when conversation changes or new message arrives

  const selectedConversation = selectedConversationId
    ? conversations.find((conv) => conv.id === selectedConversationId)
    : null

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !selectedConversationId) return

    const updatedConversations = conversations.map((conv) => {
      if (conv.id === selectedConversationId) {
        const newMsg: Message = {
          id: `m${conv.messages.length + 1}`,
          sender: "me",
          content: newMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessage: newMessage,
          lastMessageTime: newMsg.timestamp,
        }
      }
      return conv
    })
    setConversations(updatedConversations)
    setNewMessage("")
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Cargando...</h3>
        <p className="text-muted-foreground">Cargando tus mensajes.</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-foreground mb-2">Error de Autenticación</h3>
        <p className="text-muted-foreground">No se pudo cargar el perfil del usuario.</p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      <Card className="hidden w-1/3 flex-col md:flex">
        <CardHeader>
          <CardTitle>Conversaciones</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          {conversations.length === 0 ? (
            <p className="p-4 text-muted-foreground">No hay conversaciones.</p>
          ) : (
            <nav>
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted ${
                    selectedConversationId === conv.id ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedConversationId(conv.id)}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage alt="User Avatar" src="/placeholder-user.jpg" />
                    <AvatarFallback>{conv.participantName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 gap-0.5">
                    <p className="text-sm font-medium leading-none">{conv.participantName}</p>
                    <p className="text-xs text-muted-foreground">{conv.lastMessage}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{conv.lastMessageTime}</div>
                </div>
              ))}
            </nav>
          )}
        </CardContent>
      </Card>

      <Card className="flex flex-1 flex-col">
        <CardHeader className="border-b">
          <CardTitle>
            {selectedConversation ? selectedConversation.participantName : "Selecciona una conversación"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4">
          {selectedConversation ? (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${message.sender === "me" ? "justify-end" : ""}`}
                  >
                    {message.sender === "other" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage alt="User Avatar" src="/placeholder-user.jpg" />
                        <AvatarFallback>{selectedConversation.participantName[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg p-3 text-sm ${
                        message.sender === "me"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="mt-1 text-right text-xs opacity-70">{message.timestamp}</p>
                    </div>
                    {message.sender === "me" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage alt="User Avatar" src="/placeholder-user.jpg" />
                        <AvatarFallback>{profile?.first_name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No hay conversación seleccionada.
            </div>
          )}
        </CardContent>
        {selectedConversation && (
          <CardFooter className="border-t p-4">
            <div className="flex w-full items-center space-x-2">
              <Input
                placeholder="Escribe tu mensaje..."
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
                <span className="sr-only">Enviar mensaje</span>
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
