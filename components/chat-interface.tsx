"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Send,
  Smile,
  Paperclip,
  FileText,
  ImageIcon,
  Camera,
  Mic,
  User,
  Phone,
  Video,
  MoreVertical,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Message {
  id: number
  sender: "client" | "advisor"
  content: string
  timestamp: string
  type: "text" | "file" | "image"
  fileName?: string
}

interface ChatInterfaceProps {
  caseId: number
  advisorName: string
  advisorAvatar?: string
  currentUser: "client" | "advisor"
}

export function ChatInterface({ caseId, advisorName, advisorAvatar, currentUser }: ChatInterfaceProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "advisor",
      content: "Hola! Soy tu asesor asignado. ¿En qué puedo ayudarte hoy?",
      timestamp: "10:30 AM",
      type: "text",
    },
    {
      id: 2,
      sender: "client",
      content: "Hola, necesito ayuda con mi situación financiera actual.",
      timestamp: "10:32 AM",
      type: "text",
    },
    {
      id: 3,
      sender: "advisor",
      content: "Por supuesto, estaré encantado de ayudarte. ¿Podrías contarme más detalles sobre tu situación?",
      timestamp: "10:33 AM",
      type: "text",
    },
    {
      id: 4,
      sender: "client",
      content: "Presupuesto_Familiar.pdf",
      timestamp: "10:35 AM",
      type: "file",
      fileName: "Presupuesto_Familiar.pdf",
    },
    {
      id: 5,
      sender: "client",
      content: "Aquí tienes mi presupuesto actual. Como puedes ver, tengo algunos problemas para llegar a fin de mes.",
      timestamp: "10:35 AM",
      type: "text",
    },
  ])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const emojis = ["😊", "😂", "❤️", "👍", "👎", "😢", "😮", "😡", "🙏", "👏", "🎉", "💪"]

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: currentUser,
        content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "text",
      }
      setMessages([...messages, newMessage])
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleFileUpload = (type: "file" | "image") => {
    if (type === "file") {
      fileInputRef.current?.click()
    } else {
      imageInputRef.current?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "file" | "image") => {
    const file = e.target.files?.[0]
    if (file) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: currentUser,
        content: file.name,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: type,
        fileName: file.name,
      }
      setMessages([...messages, newMessage])
    }
  }

  const addEmoji = (emoji: string) => {
    setMessage(message + emoji)
  }

  return (
    <Card className="h-[600px] flex flex-col border-border/40">
      {/* Chat Header */}
      <CardHeader className="border-b border-border/40 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={advisorAvatar || "/placeholder.svg"} />
              <AvatarFallback>{advisorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{advisorName}</h3>
              <p className="text-xs text-emerald-400">En línea</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                <DropdownMenuItem>Buscar mensajes</DropdownMenuItem>
                <DropdownMenuItem>Silenciar notificaciones</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === currentUser ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.sender === currentUser ? "bg-emerald-500 text-white" : "bg-muted text-foreground"
              }`}
            >
              {msg.type === "file" && (
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">{msg.fileName}</span>
                </div>
              )}
              {msg.type === "image" && (
                <div className="flex items-center space-x-2 mb-2">
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{msg.fileName}</span>
                </div>
              )}
              <p className="text-sm">{msg.content}</p>
              <p
                className={`text-xs mt-1 ${msg.sender === currentUser ? "text-emerald-100" : "text-muted-foreground"}`}
              >
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
      </CardContent>

      {/* Message Input */}
      <div className="border-t border-border/40 p-4">
        <div className="flex items-center space-x-2">
          {/* Attachment Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Paperclip className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" className="w-48">
              <DropdownMenuItem onClick={() => handleFileUpload("file")}>
                <FileText className="w-4 h-4 mr-2" />
                Documento
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFileUpload("image")}>
                <ImageIcon className="w-4 h-4 mr-2" />
                Fotos y videos
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Camera className="w-4 h-4 mr-2" />
                Cámara
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mic className="w-4 h-4 mr-2" />
                Audio
              </DropdownMenuItem>
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Contacto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Message Input */}
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje"
              className="pr-10"
            />

            {/* Emoji Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Smile className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="grid grid-cols-6 gap-2">
                  {emojis.map((emoji, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => addEmoji(emoji)}
                      className="h-8 w-8 p-0"
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Send Button */}
          <Button onClick={sendMessage} size="icon" className="bg-emerald-500 hover:bg-emerald-600">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
        onChange={(e) => handleFileChange(e, "file")}
      />
      <input
        ref={imageInputRef}
        type="file"
        className="hidden"
        accept="image/*,video/*"
        onChange={(e) => handleFileChange(e, "image")}
      />
    </Card>
  )
}
