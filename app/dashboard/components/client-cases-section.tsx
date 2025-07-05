"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EyeIcon, MessageSquareIcon, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"

interface Case {
  id: string
  title: string
  description: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high"
  created_at: string
  due_date: string | null
  client_id: string
  advisor_id: string | null
  progress: number | null
  case_type: string | null
  advisors: {
    first_name: string
    last_name: string
  } | null
}

export function ClientCasesSection() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchClientCases()
  }, [])

  const fetchClientCases = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("cases")
      .select("*, advisors:advisor_id(first_name, last_name)")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching client cases:", error)
      // Optionally show a toast notification
    } else {
      setCases(data as Case[])
    }
    setLoading(false)
  }

  const handleOpenModal = (caseItem: Case) => {
    setSelectedCase(caseItem)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCase(null)
  }

  const getStatusBadgeClass = (status: Case["status"]) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
      default:
        return ""
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Casos</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Cargando casos...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Casos</CardTitle>
      </CardHeader>
      <CardContent>
        {cases.length === 0 ? (
          <p className="text-center text-muted-foreground">No tienes casos para mostrar.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Asesor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((caseItem) => (
                <TableRow key={caseItem.id}>
                  <TableCell className="font-medium">{caseItem.title}</TableCell>
                  <TableCell>
                    {caseItem.advisors
                      ? `${caseItem.advisors.first_name} ${caseItem.advisors.last_name}`
                      : "Sin asignar"}
                  </TableCell>
                  <TableCell>{caseItem.case_type || "N/A"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(caseItem.status)}>{caseItem.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Progress value={caseItem.progress || 0} className="w-[60%]" />
                    <span className="ml-2 text-sm text-muted-foreground">{caseItem.progress || 0}%</span>
                  </TableCell>
                  <TableCell>{format(new Date(caseItem.created_at), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleOpenModal(caseItem)}>
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                    <Button variant="ghost" size="sm" className="ml-2">
                      <MessageSquareIcon className="h-4 w-4" />
                      <span className="sr-only">Mensajes</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      {selectedCase && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalles del Caso: {selectedCase.title}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Título:</Label>
                <span className="col-span-3 font-medium">{selectedCase.title}</span>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right">Descripción:</Label>
                <p className="col-span-3 text-sm text-muted-foreground">{selectedCase.description}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Asesor:</Label>
                <span className="col-span-3">
                  {selectedCase.advisors
                    ? `${selectedCase.advisors.first_name} ${selectedCase.advisors.last_name}`
                    : "Sin asignar"}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Tipo:</Label>
                <span className="col-span-3">{selectedCase.case_type || "N/A"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Estado:</Label>
                <span className="col-span-3">
                  <Badge className={getStatusBadgeClass(selectedCase.status)}>{selectedCase.status}</Badge>
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Prioridad:</Label>
                <span className="col-span-3">{selectedCase.priority}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Progreso:</Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Progress value={selectedCase.progress || 0} className="w-[70%]" />
                  <span className="text-sm text-muted-foreground">{selectedCase.progress || 0}%</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Fecha de Creación:</Label>
                <span className="col-span-3">{format(new Date(selectedCase.created_at), "dd/MM/yyyy HH:mm")}</span>
              </div>
              {selectedCase.due_date && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Fecha Límite:</Label>
                  <span className="col-span-3">{format(new Date(selectedCase.due_date), "dd/MM/yyyy")}</span>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseModal}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}
