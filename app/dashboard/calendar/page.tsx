"use client"

import type React from "react"

import { CalendarComponent } from "@/components/calendar-component"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export default function CalendarPage() {
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    description: "",
    type: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setNewEvent((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (value: string, id: string) => {
    setNewEvent((prev) => ({ ...prev, [id]: value }))
  }

  const handleAddEvent = () => {
    console.log("New Event:", newEvent)
    // Here you would typically send this data to your backend
    // and then refresh the calendar events.
    setNewEvent({ title: "", date: "", time: "", description: "", type: "" })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Calendario</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600">Agregar Evento</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Evento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Título
                </Label>
                <Input id="title" value={newEvent.title} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Fecha
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={newEvent.date}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right">
                  Hora
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={newEvent.time}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Tipo
                </Label>
                <Select value={newEvent.type} onValueChange={(value) => handleSelectChange(value, "type")}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Reunión</SelectItem>
                    <SelectItem value="task">Tarea</SelectItem>
                    <SelectItem value="deadline">Fecha Límite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={handleAddEvent}>Guardar Evento</Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Vista de Calendario</CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarComponent />
        </CardContent>
      </Card>
    </div>
  )
}
