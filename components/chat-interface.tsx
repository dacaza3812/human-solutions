"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface Message {
  id: string
  sender: "user" | "ai"
  text: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "ai", text: "Hola, ¿en qué puedo ayudarte hoy?" },
  ])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const handleSend = () => {
    if (input.trim()) {
      const newUserMessage: Message = {
        id: Date.now().toString(),
        sender: "user",
        text: input,
      }
      setMessages((prevMessages) => [...prevMessages, newUserMessage])
      setInput("")

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: Date.now().toString() + "-ai",
          sender: "ai",
          text: "Gracias por tu mensaje. Un asesor se pondrá en contacto contigo pronto.",
        }
        setMessages((prevMessages) => [...prevMessages, aiResponse])
      }, 1000)
    }
  }

  return (
    <Card className="flex flex-col h-[400px]">
      <CardHeader>
        <CardTitle>Asistencia Rápida</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.sender === "user" ? "bg-emerald-500 text-white" : "bg-muted text-foreground"
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="border-t p-4">
        <div className="flex w-full space-x-2">
          <Input
            placeholder="Escribe tu mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSend()
              }
            }}
          />
          <Button onClick={handleSend}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
