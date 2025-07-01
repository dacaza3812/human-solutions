"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (input.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: input,
        sender: "user",
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prevMessages) => [...prevMessages, newMessage])
      setInput("")

      // Simulate bot response
      setTimeout(() => {
        const botResponse: Message = {
          id: Date.now().toString() + "-bot",
          text: `Echo: ${input}`,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
        }
        setMessages((prevMessages) => [...prevMessages, botResponse])
      }, 1000)
    }
  }

  return (
    <Card className="flex h-[500px] w-full max-w-md flex-col">
      <CardHeader className="border-b">
        <CardTitle>Chat en Vivo</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <ScrollArea className="h-full pr-4">
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex items-start gap-3", message.sender === "user" ? "justify-end" : "justify-start")}
              >
                {message.sender === "bot" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "rounded-lg p-3 text-sm",
                    message.sender === "user"
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-50",
                  )}
                >
                  <p>{message.text}</p>
                  <span
                    className={cn(
                      "mt-1 block text-xs",
                      message.sender === "user" ? "text-emerald-100" : "text-gray-500 dark:text-gray-400",
                    )}
                  >
                    {message.timestamp}
                  </span>
                </div>
                {message.sender === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        <div className="flex w-full items-center gap-2">
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
          <Button type="submit" onClick={handleSendMessage} className="bg-emerald-500 hover:bg-emerald-600">
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
