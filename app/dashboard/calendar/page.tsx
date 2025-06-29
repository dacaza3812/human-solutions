"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { FileText } from "lucide-react"

function CalendarContent() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <FileText className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">Vista en Desarrollo</h3>
      <p className="text-muted-foreground">La sección "Calendario" estará disponible próximamente.</p>
    </div>
  )
}

export default function CalendarPage() {
  return (
    <ProtectedRoute>
      <CalendarContent />
    </ProtectedRoute>
  )
}
