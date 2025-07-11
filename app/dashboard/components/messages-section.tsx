"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChatInterface } from "@/components/chat-interface"

// Define un tipo para el perfil de usuario si no existe
interface UserProfile {
  id: string
  first_name?: string | null
  last_name?: string | null
  account_type?: string | null
  phone?: string | null
  created_at?: string | null
  referral_code?: string | null
  stripe_customer_id?: string | null
  // Añade cualquier otro campo de perfil que uses
}

interface ClientCase {
  id: number
  title: string
  type: string
  status: string
  advisor: string
  advisorAvatar: string
  description: string
  createdDate: string
  nextAppointment: string | null
  progress: number
}

interface AdvisorCase {
  id: number
  clientName: string
  clientId: number
  title: string
  type: string
  status: string
  priority: string
  createdDate: string
  dueDate: string
  description: string
  progress: number
}

interface MessagesSectionProps {
  profile: UserProfile | null
  activeChat: number | null
  setActiveChat: (chatId: number | null) => void
  userCases: ClientCase[]
  advisorCases: AdvisorCase[]
}

export function MessagesSection({ profile, activeChat, setActiveChat, userCases, advisorCases }: MessagesSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Mensajes</h2>
          <p className="text-muted-foreground">
            {profile?.account_type === "client"
              ? "Comunícate con tus asesores asignados"
              : "Comunícate con tus clientes"}
          </p>
        </div>
      </div>

      {activeChat ? (
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setActiveChat(null)} className="mb-4">
            ← Volver a conversaciones
          </Button>

          {profile?.account_type === "client"
            ? (() => {
                const case_item = userCases.find((c) => c.id === activeChat)
                return case_item ? (
                  <ChatInterface
                    caseId={activeChat}
                    advisorName={case_item.advisor}
                    advisorAvatar={case_item.advisorAvatar}
                    currentUser="client"
                  />
                ) : null
              })()
            : (() => {
                const case_item = advisorCases.find((c) => c.id === activeChat)
                return case_item ? (
                  <ChatInterface
                    caseId={activeChat}
                    advisorName={`${profile?.first_name} ${profile?.last_name}`}
                    advisorAvatar="/placeholder-user.jpg"
                    currentUser="advisor"
                  />
                ) : null
              })()}
        </div>
      ) : (
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold text-foreground">Conversaciones Activas</h3>

          {profile?.account_type === "client"
            ? userCases
                .filter((c) => c.status !== "Completada")
                .map((case_item) => (
                  <Card
                    key={case_item.id}
                    className="border-border/40 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setActiveChat(case_item.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={case_item.advisorAvatar || "/placeholder.svg"} />
                          <AvatarFallback>{case_item.advisor.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{case_item.advisor}</h4>
                          <p className="text-sm text-muted-foreground">{case_item.title}</p>
                          <p className="text-xs text-muted-foreground">Último mensaje: Hace 2 horas</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                            {case_item.status}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            : advisorCases
                .filter((c) => c.status !== "Completada")
                .map((case_item) => (
                  <Card
                    key={case_item.id}
                    className="border-border/40 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setActiveChat(case_item.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>{case_item.clientName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{case_item.clientName}</h4>
                          <p className="text-sm text-muted-foreground">{case_item.title}</p>
                          <p className="text-xs text-muted-foreground">Último mensaje: Hace 1 hora</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            {case_item.status}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
        </div>
      )}
    </div>
  )
}
