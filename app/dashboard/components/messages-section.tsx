"use client"

import { useState } from "react"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Send, Paperclip } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: number
  sender: string
  avatar: string
  content: string
  time: string
  isUser: boolean
}

interface Chat {
  id: number
  name: string
  avatar: string
  lastMessage: string
  time: string
  messages: Message[]
}

export function MessagesSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [newMessage, setNewMessage] = useState("")

  const chats: Chat[] = [
    {
      id: 1,
      name: "Juan Pérez",
      avatar: "/placeholder-user.jpg",
      lastMessage: "Claro, nos vemos el viernes.",
      time: "10:30 AM",
      messages: [
        {
          id: 1,
          sender: "Juan Pérez",
          avatar: "/placeholder-user.jpg",
          content: "Hola, ¿cómo estás?",
          time: "10:00 AM",
          isUser: false,
        },
        {
          id: 2,
          sender: "Tú",
          avatar: "/placeholder-user.jpg",
          content: "Muy bien, gracias. ¿Necesitas algo?",
          time: "10:05 AM",
          isUser: true,
        },
        {
          id: 3,
          sender: "Juan Pérez",
          avatar: "/placeholder-user.jpg",
          content: "Sí, quería preguntarte sobre el caso de la asesoría financiera.",
          time: "10:10 AM",
          isUser: false,
        },
        {
          id: 4,
          sender: "Tú",
          avatar: "/placeholder-user.jpg",
          content: "Claro, nos vemos el viernes.",
          time: "10:30 AM",
          isUser: true,
        },
      ],
    },
    {
      id: 2,
      name: "María López",
      avatar: "/placeholder-user.jpg",
      lastMessage: "Entendido, prepararé los documentos.",
      time: "Ayer",
      messages: [
        {
          id: 1,
          sender: "María López",
          avatar: "/placeholder-user.jpg",
          content: "Hola, ¿ya tienes los documentos listos?",
          time: "Ayer 3:00 PM",
          isUser: false,
        },
        {
          id: 2,
          sender: "Tú",
          avatar: "/placeholder-user.jpg",
          content: "Sí, los estoy revisando ahora mismo.",
          time: "Ayer 3:15 PM",
          isUser: true,
        },
        {
          id: 3,
          sender: "María López",
          avatar: "/placeholder-user.jpg",
          content: "Entendido, prepararé los documentos.",
          time: "Ayer 3:30 PM",
          isUser: false,
        },
      ],
    },
    {
      id: 3,
      name: "Carlos Mendoza",
      avatar: "/placeholder-user.jpg",
      lastMessage: "Gracias por tu ayuda.",
      time: "2 días atrás",
      messages: [
        {
          id: 1,
          sender: "Carlos Mendoza",
          avatar: "/placeholder-user.jpg",
          content: "Necesito ayuda con un tema legal.",
          time: "2 días atrás 11:00 AM",
          isUser: false,
        },
        {
          id: 2,
          sender: "Tú",
          avatar: "/placeholder-user.jpg",
          content: "Claro, cuéntame más.",
          time: "2 días atrás 11:10 AM",
          isUser: true,
        },
        {
          id: 3,
          sender: "Carlos Mendoza",
          avatar: "/placeholder-user.jpg",
          content: "Gracias por tu ayuda.",
          time: "2 días atrás 11:30 AM",
          isUser: false,
        },
      ],
    },
  ]

  const filteredChats = chats.filter((chat) => chat.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSendMessage = () => {
    if (newMessage.trim() && activeChat) {
      const updatedChats = chats.map((chat) =>
        chat.id === activeChat.id
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  id: chat.messages.length + 1,
                  sender: "Tú",
                  avatar: "/placeholder-user.jpg",
                  content: newMessage,
                  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  isUser: true,
                },
              ],
              lastMessage: newMessage,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
          : chat,
      )
      // In a real app, you'd update the state with updatedChats
      // For this mock, we'll just update the activeChat directly
      setActiveChat((prev) =>
        prev
          ? {
              ...prev,
              messages: [
                ...prev.messages,
                {
                  id: prev.messages.length + 1,
                  sender: "Tú",
                  avatar: "/placeholder-user.jpg",
                  content: newMessage,
                  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  isUser: true,
                },
              ],
              lastMessage: newMessage,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
          : null,
      )
      setNewMessage("")
    }
  }

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col">
      <h2 className="text-3xl font-bold text-foreground mb-6">Mensajes</h2>

      <div className="flex flex-1 overflow-hidden rounded-lg border border-border/40">
        {/* Chat List */}
        <div className="w-1/3 border-r border-border/40 flex flex-col">
          <div className="p-4 border-b border-border/40">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar chats..."
                className="w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center gap-3 p-4 border-b border-border/40 cursor-pointer hover:bg-muted/50 ${
                  activeChat?.id === chat.id ? "bg-muted" : ""
                }`}
                onClick={() => setActiveChat(chat)}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={chat.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{chat.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
                <span className="text-xs text-muted-foreground">{chat.time}</span>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          {activeChat ? (
            <>
              <CardHeader className="border-b border-border/40 p-4 flex flex-row items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={activeChat.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{activeChat.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-foreground">{activeChat.name}</CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {activeChat.messages.map((message) => (
                    <div key={message.id} className={`flex items-start gap-3 ${message.isUser ? "justify-end" : ""}`}>
                      {!message.isUser && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={message.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <span className="text-xs opacity-70 block mt-1 text-right">{message.time}</span>
                      </div>
                      {message.isUser && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={message.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="border-t border-border/40 p-4 flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="w-5 h-5" />
                  <span className="sr-only">Adjuntar archivo</span>
                </Button>
                <Input
                  placeholder="Escribe un mensaje..."
                  className="flex-1"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage()
                    }
                  }}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="w-5 h-5" />
                  <span className="sr-only">Enviar mensaje</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              Selecciona un chat para empezar a mensajear.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
