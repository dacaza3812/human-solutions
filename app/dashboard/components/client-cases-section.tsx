"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Plus } from "lucide-react"

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

interface ClientCasesSectionProps {
  userCases: ClientCase[]
  openChatForCase: (caseId: number) => void
}

export function ClientCasesSection({ userCases, openChatForCase }: ClientCasesSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Mis Casos</h2>
          <p className="text-muted-foreground">Gestiona tus casos activos y completados.</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Caso
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {userCases.map((case_item) => (
          <Card key={case_item.id} className="border-border/40">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">{case_item.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{case_item.type}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{case_item.description}</p>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Estado: {case_item.status}</span>
                <span>Progreso: {case_item.progress}%</span>
              </div>
              <Progress value={case_item.progress} className="w-full" />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={case_item.advisorAvatar || "/placeholder.svg"} alt={case_item.advisor} />
                    <AvatarFallback>{case_item.advisor[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">{case_item.advisor}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => openChatForCase(case_item.id)}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Mensaje
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
