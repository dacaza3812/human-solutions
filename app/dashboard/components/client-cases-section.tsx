"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, MessageCircle } from "lucide-react"

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
          <p className="text-muted-foreground">Gestiona y revisa el progreso de tus casos</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          <Plus className="w-4 h-4 mr-2" />
          Solicitar Nuevo Caso
        </Button>
      </div>

      <div className="grid gap-6">
        {userCases.map((case_item) => (
          <Card key={case_item.id} className="border-border/40">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-foreground">{case_item.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{case_item.type}</p>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    case_item.status === "Completada"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
                      : case_item.status === "En Progreso"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                  }`}
                >
                  {case_item.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{case_item.description}</p>

              {/* Advisor Info */}
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={case_item.advisorAvatar || "/placeholder.svg"} />
                  <AvatarFallback>{case_item.advisor.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Asesor Asignado</p>
                  <p className="text-sm text-muted-foreground">{case_item.advisor}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => openChatForCase(case_item.id)}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Mensaje
                </Button>
              </div>

              {/* Progress Bar */}
              {case_item.status !== "Completada" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="text-foreground">{case_item.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${case_item.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Case Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Fecha de Creación</p>
                  <p className="font-medium">{new Date(case_item.createdDate).toLocaleDateString()}</p>
                </div>
                {case_item.nextAppointment && (
                  <div>
                    <p className="text-muted-foreground">Próxima Cita</p>
                    <p className="font-medium">{case_item.nextAppointment}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}