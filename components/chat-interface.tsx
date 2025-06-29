"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Paperclip } from "lucide-react"

interface Message {
  id: number
  sender: "user" | "advisor" | "client"
  text: string
  timestamp: string
  avatar?: string
}

interface ChatInterfaceProps {
  activeChatId: number | null
  profile: { account_type?: string | null } | null
  userCases: any[] // Replace with actual ClientCase type if available
  advisorCases: any[] // Replace with actual AdvisorCase type if available
}

export function ChatInterface({ activeChatId, profile, userCases, advisorCases }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentCase =
    profile?.account_type === "client"
      ? userCases.find((c) => c.id === activeChatId)
      : advisorCases.find((c) => c.id === activeChatId)

  const chatPartnerName =
    profile?.account_type === "client" ? currentCase?.advisor || "Asesor" : currentCase?.clientName || "Cliente"

  useEffect(() => {
    // Mock fetching messages for the active chat
    if (activeChatId) {
      setMessages([
        {
          id: 1,
          sender: "advisor",
          text: `Hola, ¿en qué puedo ayudarte con el caso ${currentCase?.title || activeChatId}?`,
          timestamp: "10:00 AM",
          avatar: "/placeholder-user.jpg",
        },
        {
          id: 2,
          sender: "user",
          text: "Hola, tengo una pregunta sobre el progreso del caso.",
          timestamp: "10:05 AM",
          avatar: "/placeholder-user.jpg",
        },
      ])
    } else {
      setMessages([])
    }
  }, [activeChatId, currentCase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          sender: "user", // Assuming the current user is always 'user' for sending
          text: input.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          avatar: "/placeholder-user.jpg",
        },
      ])
      setInput("")
    }
  }

  if (!activeChatId) {
    return (
      <Card className="flex flex-col h-[calc(100vh-160px)] border-border/40">
        <CardHeader>
          <CardTitle>Mensajes</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center text-muted-foreground">
          Selecciona un caso para ver los mensajes.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-160px)] border-border/40">
      <CardHeader className="border-b border-border/40 p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={currentCase?.advisorAvatar || "/placeholder-user.jpg"} />
            <AvatarFallback>{chatPartnerName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{chatPartnerName}</CardTitle>
            <p className="text-sm text-muted-foreground">{currentCase?.title || `Caso #${activeChatId}`}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender !== "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.avatar || "/placeholder-user.jpg"} />
                    <AvatarFallback>{message.sender[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender === "user" ? "bg-emerald-500 text-white rounded-br-none" : "bg-muted rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <span
                    className={`block text-xs mt-1 ${
                      message.sender === "user" ? "text-emerald-100" : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp}
                  </span>
                </div>
                {message.sender === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.avatar || "/placeholder-user.jpg"} />
                    <AvatarFallback>{message.sender[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t border-border/40 p-4">
        <div className="flex w-full items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5 text-muted-foreground" />
            <span className="sr-only">Adjuntar archivo</span>
          </Button>
          <Input
            placeholder="Escribe tu mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSendMessage()
              }
            }}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} className="bg-emerald-500 hover:bg-emerald-600">
            <Send className="h-5 w-5" />
            <span className="sr-only">Enviar mensaje</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
