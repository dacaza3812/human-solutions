"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle, XCircle, FileText } from "lucide-react"

interface Case {
  id: string
  title: string
  status: string
  lastUpdate: string
  description?: string
  clientName?: string
  advisorName?: string
}

export default function CasesPage() {
  const { profile, loading } = useAuth()
  const [cases, setCases] = useState<Case[]>([])
  const [loadingCases, setLoadingCases] = useState(true)

  useEffect(() => {
    // Simulate fetching cases based on user role
    setLoadingCases(true)
    setTimeout(() => {
      if (profile?.account_type === "client") {
        setCases([
          {
            id: "c1",
            title: "Divorcio de mutuo acuerdo",
            status: "En progreso",
            lastUpdate: "2023-10-26",
            description: "Proceso de divorcio amistoso con reparto de bienes.",
            advisorName: "Lic. Juan Pérez",
          },
          {
            id: "c2",
            title: "Reclamación por accidente de tráfico",
            status: "Pendiente",
            lastUpdate: "2023-10-20",
            description: "Demanda por lesiones personales tras colisión vehicular.",
            advisorName: "Lic. María López",
          },
          {
            id: "c3",
            title: "Herencia familiar",
            status: "Completado",
            lastUpdate: "2023-09-15",
            description: "Gestión de la sucesión de bienes de un familiar.",
            advisorName: "Lic. Juan Pérez",
          },
        ])
      } else if (profile?.account_type === "advisor") {
        setCases([
          {
            id: "a1",
            title: "Asesoría legal para startup",
            status: "En progreso",
            lastUpdate: "2023-10-28",
            description: "Constitución de empresa y contratos iniciales.",
            clientName: "Tech Innovators S.A.",
          },
          {
            id: "a2",
            title: "Defensa penal - Robo",
            status: "Activo",
            lastUpdate: "2023-10-27",
            description: "Representación en caso de robo con violencia.",
            clientName: "Carlos Ruiz",
          },
          {
            id: "a3",
            title: "Contrato de arrendamiento comercial",
            status: "Pendiente",
            lastUpdate: "2023-10-25",
            description: "Revisión y redacción de contrato para local comercial.",
            clientName: "Inversiones Alfa",
          },
        ])
      }
      setLoadingCases(false)
    }, 1000)
  }, [profile])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "En progreso":
      case "Activo":
        return "default"
      case "Pendiente":
        return "secondary"
      case "Completado":
        return "success" // Assuming you have a 'success' variant for Badge
      default:
        return "outline"
    }
  }

  if (loading || loadingCases) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Cargando...</h3>
        <p className="text-muted-foreground">Cargando tus casos.</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-foreground mb-2">Error de Autenticación</h3>
        <p className="text-muted-foreground">No se pudo cargar el perfil del usuario.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Mis Casos</h2>
          <p className="text-muted-foreground">Gestiona todos tus asuntos legales aquí.</p>
        </div>
        {profile.account_type === "client" && (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Caso
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Casos</CardTitle>
          <CardDescription>
            {profile.account_type === "client"
              ? "Aquí puedes ver el estado de tus casos activos e históricos."
              : "Aquí puedes ver los casos que estás gestionando."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cases.length === 0 ? (
            <p className="text-muted-foreground">No hay casos para mostrar.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título del Caso</TableHead>
                  {profile.account_type === "advisor" && <TableHead>Cliente</TableHead>}
                  <TableHead>Estado</TableHead>
                  <TableHead>Última Actualización</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    {profile.account_type === "advisor" && <TableCell>{c.clientName || "N/A"}</TableCell>}
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(c.status)}>{c.status}</Badge>
                    </TableCell>
                    <TableCell>{c.lastUpdate}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
