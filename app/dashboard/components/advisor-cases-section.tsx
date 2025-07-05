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
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

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
  clients: {
    first_name: string
    last_name: string
  } | null
}

export function AdvisorCasesSection() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<Case["status"] | "">("")
  const [currentPriority, setCurrentPriority] = useState<Case["priority"] | "">("")
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchAdvisorCases()
  }, [])

  const fetchAdvisorCases = async () => {
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
      .select("*, clients:client_id(first_name, last_name)")
      .or(`advisor_id.eq.${user.id},advisor_id.is.null`) // Cases assigned to advisor or unassigned
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching advisor cases:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los casos del asesor.",
        variant: "destructive",
      })
    } else {
      setCases(data as Case[])
    }
    setLoading(false)
  }

  const handleOpenModal = (caseItem: Case) => {
    setSelectedCase(caseItem)
    setCurrentStatus(caseItem.status)
    setCurrentPriority(caseItem.priority)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCase(null)
    setCurrentStatus("")
    setCurrentPriority("")
  }

  const handleStatusChange = async (newStatus: Case["status"]) => {
    if (!selectedCase) return

    setIsUpdating(true)
    const { error } = await supabase.from("cases").update({ status: newStatus }).eq("id", selectedCase.id)

    if (error) {
      console.error("Error updating case status:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del caso.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Éxito",
        description: "Estado del caso actualizado correctamente.",
      })
      setCurrentStatus(newStatus)
      setCases((prev) => prev.map((c) => (c.id === selectedCase.id ? { ...c, status: newStatus } : c)))
      setSelectedCase((prev) => (prev ? { ...prev, status: newStatus } : null))
    }
    setIsUpdating(false)
  }

  const handlePriorityChange = async (newPriority: Case["priority"]) => {
    if (!selectedCase) return

    setIsUpdating(true)
    const { error } = await supabase.from("cases").update({ priority: newPriority }).eq("id", selectedCase.id)

    if (error) {
      console.error("Error updating case priority:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la prioridad del caso.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Éxito",
        description: "Prioridad del caso actualizada correctamente.",
      })
      setCurrentPriority(newPriority)
      setCases((prev) => prev.map((c) => (c.id === selectedCase.id ? { ...c, priority: newPriority } : c)))
      setSelectedCase((prev) => (prev ? { ...prev, priority: newPriority } : null))
    }
    setIsUpdating(false)
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
          <CardTitle>Casos Asignados</CardTitle>
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
        <CardTitle>Casos Asignados</CardTitle>
      </CardHeader>
      <CardContent>
        {cases.length === 0 ? (
          <p className="text-center text-muted-foreground">No hay casos asignados para mostrar.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((caseItem) => (
                <TableRow key={caseItem.id}>
                  <TableCell className="font-medium">
                    {caseItem.clients?.first_name} {caseItem.clients?.last_name}
                  </TableCell>
                  <TableCell>{caseItem.title}</TableCell>
                  <TableCell>{caseItem.case_type || "N/A"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(caseItem.status)}>{caseItem.status}</Badge>
                  </TableCell>
                  <TableCell>{caseItem.priority}</TableCell>
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
                <Label className="text-right">Cliente:</Label>
                <span className="col-span-3 font-medium">
                  {selectedCase.clients?.first_name} {selectedCase.clients?.last_name}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Título:</Label>
                <span className="col-span-3 font-medium">{selectedCase.title}</span>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right">Descripción:</Label>
                <p className="col-span-3 text-sm text-muted-foreground">{selectedCase.description}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Tipo:</Label>
                <span className="col-span-3">{selectedCase.case_type || "N/A"}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Estado:</Label>
                <Select value={currentStatus} onValueChange={handleStatusChange} disabled={isUpdating}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Abierto</SelectItem>
                    <SelectItem value="in_progress">En Progreso</SelectItem>
                    <SelectItem value="resolved">Resuelto</SelectItem>
                    <SelectItem value="closed">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Prioridad:</Label>
                <Select value={currentPriority} onValueChange={handlePriorityChange} disabled={isUpdating}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
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
