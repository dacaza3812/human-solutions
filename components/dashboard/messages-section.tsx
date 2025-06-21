"use client"

import { ChatInterface } from "@/components/chat-interface"
import { useAuth } from "@/contexts/auth-context"

export function MessagesSection() {
  const { profile } = useAuth()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Mensajes</h2>
          <p className="text-muted-foreground">Comunícate con tus clientes y asesores</p>
        </div>
      </div>
      <ChatInterface
        caseId={1}
        advisorName={profile?.account_type === "advisor" ? "Tú" : "Dr. María González"}
        advisorAvatar="/placeholder-user.jpg"
        currentUser={profile?.account_type === "advisor" ? "advisor" : "client"}
      />
    </div>
  )
}
