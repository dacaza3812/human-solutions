"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

interface NewCaseFormProps {
  isAdvisor?: boolean
  onCaseCreated?: () => void
}

export function NewCaseForm({ isAdvisor = false, onCaseCreated }: NewCaseFormProps) {
  const [newCase, setNewCase] = useState({
    title: "",
    description: "",
    type: "",
    priority: "",
    client: "", // Only for advisors
    dueDate: "", // Only for advisors
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setNewCase((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (value: string, id: string) => {
    setNewCase((prev) => ({ ...prev, [id]: value }))
  }

  const handleCreateCase = () => {
    console.log("New Case:", newCase)
    // In a real application, you would send this data to your backend
    // and then call onCaseCreated() if the creation was successful.
    setNewCase({
      title: "",
      description: "",
      type: "",
      priority: "",
      client: "",
      dueDate: "",
    })
    if (onCaseCreated) {
      onCaseCreated()
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Caso
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Caso</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Título
            </Label>
            <Input id="title" value={newCase.title} onChange={handleInputChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={newCase.description}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Tipo
            </Label>
            <Select value={newCase.type} onValueChange={(value) => handleSelectChange(value, "type")}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asesoria_legal">Asesoría Legal</SelectItem>
                <SelectItem value="asesoria_financiera">Asesoría Financiera</SelectItem>
                <SelectItem value="relaciones_familiares">Relaciones Familiares</SelectItem>
                <SelectItem value="otros">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isAdvisor && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client" className="text-right">
                  Cliente
                </Label>
                <Input
                  id="client"
                  value={newCase.client}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Nombre del Cliente"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  Prioridad
                </Label>
                <Select value={newCase.priority} onValueChange={(value) => handleSelectChange(value, "priority")}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right">
                  Fecha Límite
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newCase.dueDate}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </>
          )}
        </div>
        <Button onClick={handleCreateCase}>Crear Caso</Button>
      </DialogContent>
    </Dialog>
  )
}
