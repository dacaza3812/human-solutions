"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Loader2 } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "ai"
  timestamp: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() === "") return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    }
    setMessages((prevMessages) => [...prevMessages, newMessage])
    setInput("")
    setLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now().toString() + "-ai",
        text: `Hola, soy tu asistente de IA. Has dicho: "${newMessage.text}". ¿En qué más puedo ayudarte?`,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prevMessages) => [...prevMessages, aiResponse])
      setLoading(false)
    }, 1500)
  }

  return (
    <Card className="flex flex-col h-[500px] max-w-lg mx-auto">
      <CardHeader className="border-b p-4">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src="/placeholder-logo.png" alt="AI Assistant" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">Asistente de IA</h3>
            <p className="text-sm text-muted-foreground">En línea</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender === "user" ? "bg-emerald-500 text-white" : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <span className="block text-xs opacity-70 mt-1">{message.timestamp}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[70%] p-3 rounded-lg bg-muted text-foreground flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="text-sm">Escribiendo...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
          <Input
            placeholder="Escribe tu mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" disabled={loading}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
