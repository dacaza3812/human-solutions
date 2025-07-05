"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CalendarComponent() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecciona una Fecha</CardTitle>
      </CardHeader>
      <CardContent>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-[280px] justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: es }) : <span>Elige una fecha</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              locale={es} // Set locale for Spanish
            />
          </PopoverContent>
        </Popover>
        <p className="text-sm text-muted-foreground mt-4">
          Fecha seleccionada: {date ? format(date, "PPP", { locale: es }) : "Ninguna"}
        </p>
      </CardContent>
    </Card>
  )
}
