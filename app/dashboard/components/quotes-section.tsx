"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar as CalendarComponent } from "@/components/calendar-component"
import { Plus } from "lucide-react"

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

interface QuotesSectionProps {
  userScheduledCases: ClientCase[]
  selectedDate: Date
  setSelectedDate: (date: Date) => void
}

export function QuotesSection({ userScheduledCases, selectedDate, setSelectedDate }: QuotesSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Mis Citas</h2>
          <p className="text-muted-foreground">Gestiona tus citas y consultas programadas</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <CalendarComponent selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        </div>

        {/* Cases Table - Only scheduled cases for current user */}
        <div className="lg:col-span-2">
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-foreground">Mis Citas Programadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Asesor</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tipo</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fecha</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Hora</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userScheduledCases.map((case_item) => (
                      <tr key={case_item.id} className="border-b border-border/20 hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm font-medium">{case_item.advisor}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{case_item.type}</td>
                        <td className="py-3 px-4 text-sm">{new Date(case_item.createdDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-sm">
                          {case_item.nextAppointment?.split(" ")[1] || "Por definir"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              case_item.status === "En Progreso"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                            }`}
                          >
                            {case_item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
