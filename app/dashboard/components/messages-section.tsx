"use client"

import { Button } from "@/components/ui/button"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { ChatInterface } from "@/components/chat-interface"

interface UserProfile {
  id: string
  first_name?: string | null
  last_name?: string | null
  account_type?: string | null
  phone?: string | null
  created_at?: string | null
  referral_code?: string | null
  stripe_customer_id?: string | null
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
  userCases: ClientCase[]
  advisorCases: AdvisorCase[]
  activeChat: number | null
  setActiveChat: (chatId: number | null) => void
}

export function MessagesSection({ profile, userCases, advisorCases, activeChat, setActiveChat }: MessagesSectionProps) {
  const [chatSearchQuery, setChatSearchQuery] = useState("")

  const casesToDisplay = profile?.account_type === "client" ? userCases : advisorCases

  const filteredCases = casesToDisplay.filter(
    (caseItem) =>
      caseItem.title.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
      (profile?.account_type === "advisor" &&
        (caseItem as AdvisorCase).clientName.toLowerCase().includes(chatSearchQuery.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Mensajes</h2>
          <p className="text-muted-foreground">Comunícate con tus asesores o clientes.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-160px)]">
        {/* Chat List */}
        <Card className="lg:col-span-1 flex flex-col border-border/40">
          <CardHeader className="border-b border-border/40 p-4">
            <CardTitle className="text-lg">Chats</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar chat..."
                className="pl-10"
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-y-auto">
            {filteredCases.length > 0 ? (
              filteredCases.map((caseItem) => (
                <Button
                  key={caseItem.id}
                  variant="ghost"
                  className={`w-full justify-start text-left p-4 rounded-none border-b border-border/20 last:border-b-0 ${
                    activeChat === caseItem.id ? "bg-muted/50" : ""
                  }`}
                  onClick={() => setActiveChat(caseItem.id)}
                >
                  <div>
                    <p className="font-medium text-foreground">{caseItem.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {profile?.account_type === "client" ? caseItem.advisor : (caseItem as AdvisorCase).clientName}
                    </p>
                  </div>
                </Button>
              ))
            ) : (
              <p className="p-4 text-sm text-muted-foreground text-center">No se encontraron chats.</p>
            )}
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <ChatInterface
            activeChatId={activeChat}
            profile={profile}
            userCases={userCases}
            advisorCases={advisorCases}
          />
        </div>
      </div>
    </div>
  )
}
