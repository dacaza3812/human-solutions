"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function CalendarComponent() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Calendario de Citas</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          locale={es}
          weekStartsOn={1} // Monday
          formatters={{
            formatCaption: (date) => {
              return format(date, "LLLL y", { locale: es })
            },
            formatDay: (day) => {
              return format(day, "d", { locale: es })
            },
            formatWeekdayName: (day) => {
              return format(day, "EEEEE", { locale: es })
            },
          }}
        />
        {date && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Fecha seleccionada: {format(date, "PPP", { locale: es })}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
