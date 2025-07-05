"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Send, Eye, X, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-server"

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
  const { data: recentCases, error } = await supabase.from("cases").select("*").limit(3) // Fetch a few recent cases

  if (error) {
    console.error("Error fetching advisor cases:", error)
    return <p>Error loading cases.</p>
  }

  const filteredCases = advisorCases.filter((case_item) => {
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
            <option value="en progreso">En Progreso</option>
            <option value="programada">Programados</option>
            <option value="en revisión">En Revisión</option>
          </select>
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Caso
          </Button>
        </div>
      </div>

      <Card className="border-border/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Casos Recientes</CardTitle>
          <Link href="/dashboard/cases">
            <Button variant="link" size="sm" className="text-emerald-500">
              Ver todos <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentCases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tienes casos recientes asignados actualmente.</p>
          ) : (
            <ul className="space-y-3">
              {recentCases.map((caseItem) => (
                <li key={caseItem.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{caseItem.title}</p>
                    <p className="text-xs text-muted-foreground">Cliente: {caseItem.client_name || "N/A"}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      caseItem.status === "pending"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : caseItem.status === "active"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {caseItem.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Caso</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Tipo</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Estado</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Prioridad</th>
                  <th className="text-left py-4 px-6 font-medium text-muted-foreground">Fecha Límite</th>
                  <th className="text-center py-4 px-6 font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((case_item) => (
                  <tr
                    key={case_item.id}
                    className="border-b border-border/20 hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedCase(case_item)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{case_item.clientName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{case_item.clientName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-sm">{case_item.title}</p>
                        <p className="text-xs text-muted-foreground">#{case_item.id}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{case_item.type}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          case_item.status === "En Progreso"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            : case_item.status === "Programada"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                              : "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                        }`}
                      >
                        {case_item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          case_item.priority === "Alta"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                            : case_item.priority === "Media"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                              : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        }`}
                      >
                        {case_item.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm">{new Date(case_item.dueDate).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            openChatForCase(case_item.id)
                          }}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedCase(case_item)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                      selectedCase.status === "En Progreso"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                        : selectedCase.status === "Programada"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          : "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                    }`}
                  >
                    {selectedCase.status}
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
