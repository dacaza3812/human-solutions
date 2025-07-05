"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MessageCircle,
  Send,
  Search,
  Phone,
  Video,
  MoreHorizontal,
  Paperclip,
  Smile,
  Star,
  Archive,
} from "lucide-react"

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(1)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const conversations = [
    {
      id: 1,
      name: "Dr. María González",
      role: "Asesora Financiera",
      avatar: "/placeholder-user.jpg",
      lastMessage: "Perfecto, entonces nos vemos mañana a las 10:00 AM para revisar tu plan financiero.",
      timestamp: "Hace 5 min",
      unread: 2,
      online: true,
      caseTitle: "Asesoría Financiera Personal",
    },
    {
      id: 2,
      name: "Lic. Carlos Rodríguez",
      role: "Mediador Familiar",
      avatar: "/placeholder-user.jpg",
      lastMessage: "He preparado algunos ejercicios que pueden ayudar a mejorar la comunicación familiar.",
      timestamp: "Hace 1 hora",
      unread: 0,
      online: false,
      caseTitle: "Mediación Familiar",
    },
    {
      id: 3,
      name: "Abg. Ana Martínez",
      role: "Asesora Legal",
      avatar: "/placeholder-user.jpg",
      lastMessage: "Los documentos están listos. ¿Podrías revisarlos antes de nuestra próxima reunión?",
      timestamp: "Hace 3 horas",
      unread: 1,
      online: true,
      caseTitle: "Consulta Legal",
    },
    {
      id: 4,
      name: "Dra. Carmen Ruiz",
      role: "Terapeuta",
      avatar: "/placeholder-user.jpg",
      lastMessage: "Gracias por compartir tus avances. Veo mucha mejora en tu situación.",
      timestamp: "Ayer",
      unread: 0,
      online: false,
      caseTitle: "Terapia de Pareja",
    },
  ]

  const messages = [
    {
      id: 1,
      senderId: 2,
      senderName: "Dr. María González",
      content:
        "Hola! Espero que estés bien. He revisado tu situación financiera y tengo algunas recomendaciones importantes que compartir contigo.",
      timestamp: "10:30 AM",
      type: "text",
    },
    {
      id: 2,
      senderId: 1,
      senderName: "Tú",
      content:
        "¡Hola doctora! Muchas gracias por tomarse el tiempo. Estoy muy interesado en escuchar sus recomendaciones.",
      timestamp: "10:32 AM",
      type: "text",
    },
    {
      id: 3,
      senderId: 2,
      senderName: "Dr. María González",
      content:
        "Excelente. Primero, creo que sería beneficioso establecer un fondo de emergencia que cubra al menos 6 meses de gastos. También he identificado algunas áreas donde podemos optimizar tus inversiones.",
      timestamp: "10:35 AM",
      type: "text",
    },
    {
      id: 4,
      senderId: 1,
      senderName: "Tú",
      content: "Eso suena muy bien. ¿Podríamos programar una videollamada para discutir esto en detalle?",
      timestamp: "10:37 AM",
      type: "text",
    },
    {
      id: 5,
      senderId: 2,
      senderName: "Dr. María González",
      content: "Por supuesto! ¿Te parece bien mañana a las 10:00 AM? Te enviaré el enlace de la videollamada.",
      timestamp: "10:40 AM",
      type: "text",
    },
    {
      id: 6,
      senderId: 1,
      senderName: "Tú",
      content: "Perfecto, ahí estaré. Muchas gracias!",
      timestamp: "10:42 AM",
      type: "text",
    },
    {
      id: 7,
      senderId: 2,
      senderName: "Dr. María González",
      content: "Perfecto, entonces nos vemos mañana a las 10:00 AM para revisar tu plan financiero.",
      timestamp: "10:45 AM",
      type: "text",
    },
  ]

  const selectedConversation = conversations.find((conv) => conv.id === selectedChat)
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.caseTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Here you would typically send the message to your backend
      console.log("Sending message:", newMessage)
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mensajes</h1>
          <p className="text-muted-foreground mt-1">Comunícate con tus asesores y clientes</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Archive className="w-4 h-4 mr-2" />
            Archivar
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            <MessageCircle className="w-4 h-4 mr-2" />
            Nueva Conversación
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversaciones</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversaciones..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedChat(conversation.id)}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b ${
                    selectedChat === conversation.id ? "bg-emerald-50 border-l-4 border-l-emerald-500" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                        <AvatarFallback>
                          {conversation.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{conversation.name}</p>
                        {conversation.unread > 0 && (
                          <Badge variant="default" className="bg-emerald-500 text-white text-xs">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{conversation.role}</p>
                      <p className="text-sm text-muted-foreground truncate mt-1">{conversation.lastMessage}</p>
                      <p className="text-xs text-muted-foreground mt-1">{conversation.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-3 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={selectedConversation.avatar || "/placeholder.svg"}
                          alt={selectedConversation.name}
                        />
                        <AvatarFallback>
                          {selectedConversation.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {selectedConversation.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{selectedConversation.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedConversation.role}</p>
                      <p className="text-xs text-muted-foreground">{selectedConversation.caseTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Star className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.senderId === 1 ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.senderId === 1 ? "bg-emerald-500 text-white" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.senderId === 1 ? "text-emerald-100" : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <div className="flex-1 relative">
                    <Textarea
                      placeholder="Escribe tu mensaje..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="min-h-[40px] max-h-[120px] resize-none pr-12"
                    />
                    <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Selecciona una conversación</h3>
                <p className="text-muted-foreground">Elige una conversación de la lista para comenzar a chatear</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
