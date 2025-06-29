"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Case {
  id: string
  title: string
  client_name: string
  status: string
  last_updated: string
  description: string
}

export default function CasesPage() {
  const { profile, loading: authLoading } = useAuth()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    if (!authLoading && profile) {
      fetchCases()
    }
  }, [profile, authLoading])

  const fetchCases = async () => {
    setLoading(true)
    setError(null)
    try {
      // Simulate fetching data based on profile type
      if (profile?.account_type === "advisor") {
        setCases([
          {
            id: "1",
            title: "Divorcio Pérez",
            client_name: "Juan Pérez",
            status: "Activo",
            last_updated: "2024-05-20",
            description: "Caso de divorcio complejo con bienes compartidos.",
          },
          {
            id: "2",
            title: "Herencia García",
            client_name: "Ana García",
            status: "Pendiente",
            last_updated: "2024-05-18",
            description: "Sucesión testamentaria con múltiples herederos.",
          },
          {
            id: "3",
            title: "Contrato Empresa X",
            client_name: "Empresa X",
            status: "Completado",
            last_updated: "2024-05-10",
            description: "Revisión y redacción de contrato comercial.",
          },
          {
            id: "4",
            title: "Demanda Laboral",
            client_name: "Roberto Soto",
            status: "Activo",
            last_updated: "2024-05-25",
            description: "Demanda por despido injustificado.",
          },
        ])
      } else {
        // Client's own cases
        setCases([
          {
            id: "5",
            title: "Mi Caso de Divorcio",
            client_name: "Yo",
            status: "En Revisión",
            last_updated: "2024-05-22",
            description: "Mi proceso de divorcio.",
          },
          {
            id: "6",
            title: "Consulta Legal",
            client_name: "Yo",
            status: "Completado",
            last_updated: "2024-05-15",
            description: "Consulta sobre derechos de propiedad.",
          },
        ])
      }
    } catch (err) {
      console.error("Failed to fetch cases:", err)
      setError("Failed to load cases. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || c.status.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{profile?.account_type === "advisor" ? "Gestión de Casos" : "Mis Casos"}</h1>
        {profile?.account_type === "advisor" && (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Caso
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Casos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, cliente o descripción..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en revisión">En Revisión</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredCases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron casos que coincidan con tu búsqueda o filtros.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  {profile?.account_type === "advisor" && <TableHead>Cliente</TableHead>}
                  <TableHead>Estado</TableHead>
                  <TableHead>Última Actualización</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    {profile?.account_type === "advisor" && <TableCell>{c.client_name}</TableCell>}
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          c.status === "Activo"
                            ? "bg-green-100 text-green-800"
                            : c.status === "Pendiente"
                              ? "bg-yellow-100 text-yellow-800"
                              : c.status === "En Revisión"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {c.status}
                      </span>
                    </TableCell>
                    <TableCell>{c.last_updated}</TableCell>
                    <TableCell>
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
