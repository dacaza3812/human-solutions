"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { format } from "date-fns"
import { EyeIcon, PlusIcon, MessageSquareIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
}

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false)
  const [newCaseData, setNewCaseData] = useState({
    title: "",
    description: "",
    case_type: "",
    priority: "medium",
    due_date: "",
  })
  const [isSubmittingNewCase, setIsSubmittingNewCase] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchCases()
  }, [])

  const fetchCases = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError)
      setLoading(false)
      return
    }

    let query = supabase.from("cases").select("*").order("created_at", { ascending: false })

    if (profile.role === "client") {
      query = query.eq("client_id", user.id)
    } else if (profile.role === "advisor") {
      query = query.or(`advisor_id.eq.${user.id},advisor_id.is.null`) // Advisors see their cases or unassigned cases
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching cases:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los casos.",
        variant: "destructive",
      })
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

  const handleNewCaseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewCaseData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateNewCase = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingNewCase(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear un caso.",
        variant: "destructive",
      })
      setIsSubmittingNewCase(false)
      return
    }

    const { error } = await supabase.from("cases").insert({
      title: newCaseData.title,
      description: newCaseData.description,
      case_type: newCaseData.case_type,
      priority: newCaseData.priority,
      due_date: newCaseData.due_date || null,
      client_id: user.id, // The user creating the case is the client
      status: "open",
      progress: 0,
    })

    if (error) {
      console.error("Error creating new case:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el nuevo caso.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Éxito",
        description: "Nuevo caso creado exitosamente.",
      })
      setIsNewCaseModalOpen(false)
      setNewCaseData({
        title: "",
        description: "",
        case_type: "",
        priority: "medium",
        due_date: "",
      })
      fetchCases() // Refresh the list
    }
    setIsSubmittingNewCase(false)
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
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando casos...</span>
      </div>
    )
  }

  return (
    <div className="grid gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg md:text-2xl">Mis Casos</h1>
        <Button onClick={() => setIsNewCaseModalOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nuevo Caso
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Todos los Casos</CardTitle>
        </CardHeader>
        <CardContent>
          {cases.length === 0 ? (
            <p className="text-center text-muted-foreground">No hay casos para mostrar.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableCell className="font-medium">{caseItem.title}</TableCell>
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
      </Card>

      {/* View Case Details Modal */}
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

      {/* New Case Modal */}
      <Dialog open={isNewCaseModalOpen} onOpenChange={setIsNewCaseModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Caso</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateNewCase} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Caso</Label>
              <Input
                id="title"
                name="title"
                value={newCaseData.title}
                onChange={handleNewCaseChange}
                placeholder="Ej. Asesoría Legal para Contrato"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={newCaseData.description}
                onChange={handleNewCaseChange}
                placeholder="Detalla el problema o la necesidad..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="case_type">Tipo de Caso</Label>
                <Input
                  id="case_type"
                  name="case_type"
                  value={newCaseData.case_type}
                  onChange={handleNewCaseChange}
                  placeholder="Ej. Legal, Financiero, Familiar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <Select
                  name="priority"
                  value={newCaseData.priority}
                  onValueChange={(value) => handleNewCaseChange({ target: { name: "priority", value } } as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Fecha Límite (Opcional)</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                value={newCaseData.due_date}
                onChange={handleNewCaseChange}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewCaseModalOpen(false)} type="button">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmittingNewCase}>
                {isSubmittingNewCase ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Caso"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
