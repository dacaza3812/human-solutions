"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Send, X, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase-server"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

interface AdvisorCasesSectionProps {
  advisorCases: AdvisorCase[]
  openChatForCase: (caseId: number) => void
  selectedCase: AdvisorCase | null
  setSelectedCase: (caseItem: AdvisorCase | null) => void
  caseFilter: string
  setCaseFilter: (filter: string) => void
}

export default async function AdvisorCasesSection({
  advisorCases,
  openChatForCase,
  selectedCase,
  setSelectedCase,
  caseFilter,
  setCaseFilter,
}: AdvisorCasesSectionProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <p>Por favor, inicia sesión para ver tus casos.</p>
  }

  const { data: cases, error } = await supabase
    .from("cases")
    .select("*, client:client_id(name, email)")
    .eq("advisor_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching advisor cases:", error)
    return <p>Error al cargar los casos: {error.message}</p>
  }

  const filteredCases = cases.filter((case_item) => {
    if (caseFilter === "all") return true
    return case_item.status.toLowerCase().includes(caseFilter.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Mis Casos Asignados</h2>
          <p className="text-muted-foreground">Gestiona los casos de tus clientes</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={caseFilter}
            onChange={(e) => setCaseFilter(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">Todos los casos</option>
            <option value="open">Abiertos</option>
            <option value="in_progress">En Progreso</option>
            <option value="closed">Cerrados</option>
          </select>
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Caso
          </Button>
        </div>
      </div>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Casos Asignados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCases.length === 0 ? (
            <p className="text-muted-foreground">No tienes casos asignados en este momento.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título del Caso</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead>Última Actualización</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((case_item) => (
                  <TableRow key={case_item.id}>
                    <TableCell className="font-medium">{case_item.title}</TableCell>
                    <TableCell>{case_item.clientName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          case_item.status === "open"
                            ? "default"
                            : case_item.status === "in_progress"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {case_item.status === "open"
                          ? "Abierto"
                          : case_item.status === "in_progress"
                            ? "En Progreso"
                            : "Cerrado"}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(case_item.createdDate), "PPP", { locale: es })}</TableCell>
                    <TableCell>{format(new Date(case_item.dueDate), "PPP", { locale: es })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Case Detail Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{selectedCase.title}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedCase(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedCase.clientName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Caso</p>
                  <p className="font-medium">{selectedCase.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedCase.status === "open"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                        : selectedCase.status === "in_progress"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          : "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                    }`}
                  >
                    {selectedCase.status === "open"
                      ? "Abierto"
                      : selectedCase.status === "in_progress"
                        ? "En Progreso"
                        : "Cerrado"}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prioridad</p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedCase.priority === "Alta"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        : selectedCase.priority === "Media"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    }`}
                  >
                    {selectedCase.priority}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                  <p className="font-medium">{new Date(selectedCase.createdDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha Límite</p>
                  <p className="font-medium">{new Date(selectedCase.dueDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Descripción</p>
                <p className="text-sm">{selectedCase.description}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progreso del Caso</span>
                  <span className="text-foreground">{selectedCase.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${selectedCase.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => {
                    openChatForCase(selectedCase.id)
                    setSelectedCase(null)
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Mensaje
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <FileText className="w-4 h-4 mr-2" />
                  Ver Documentos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
