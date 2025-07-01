"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CalendarComponent() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendario de Citas</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
      </CardContent>
    </Card>
  )
}
