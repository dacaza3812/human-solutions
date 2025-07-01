"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"

interface Message {
  id: number
  sender: "user" | "other"
  text: string
  timestamp: string
}

interface ChatInterfaceProps {
  chatPartnerName: string
  chatPartnerAvatar: string
}

export function ChatInterface({ chatPartnerName, chatPartnerAvatar }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: "other", text: `Hola, ¿en qué puedo ayudarte hoy, ${chatPartnerName}?`, timestamp: "10:00 AM" },
    { id: 2, sender: "user", text: "Hola, tengo una pregunta sobre mi caso.", timestamp: "10:01 AM" },
  ])
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          sender: "user",
          text: newMessage.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
      setNewMessage("")
    }
  }

  return (
    <Card className="flex flex-col h-[500px] max-w-full mx-auto">
      <CardHeader className="flex flex-row items-center space-x-3 border-b p-4">
        <Avatar className="h-9 w-9">
          <AvatarImage src={chatPartnerAvatar || "/placeholder.svg"} alt={chatPartnerName} />
          <AvatarFallback>{chatPartnerName.charAt(0)}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-lg font-semibold">{chatPartnerName}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender === "user"
                      ? "bg-emerald-500 text-white rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
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
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
          <Input
            id="message"
            placeholder="Escribe tu mensaje..."
            className="flex-1"
            autoComplete="off"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="submit" size="icon" className="bg-emerald-500 hover:bg-emerald-600">
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar mensaje</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
