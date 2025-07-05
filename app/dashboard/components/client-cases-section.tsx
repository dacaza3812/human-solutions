import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase-server"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default async function ClientCasesSection() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <p>Por favor, inicia sesión para ver tus casos.</p>
  }

  const { data: cases, error } = await supabase
    .from("cases")
    .select("*, advisor:advisor_id(name, email)")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching client cases:", error)
    return <p>Error al cargar los casos: {error.message}</p>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis Casos Abiertos</CardTitle>
      </CardHeader>
      <CardContent>
        {cases.length === 0 ? (
          <p className="text-muted-foreground">No tienes casos abiertos en este momento.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título del Caso</TableHead>
                <TableHead>Asesor Asignado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead>Última Actualización</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((caseItem) => (
                <TableRow key={caseItem.id}>
                  <TableCell className="font-medium">{caseItem.title}</TableCell>
                  <TableCell>{caseItem.advisor?.name || "No asignado"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        caseItem.status === "open"
                          ? "default"
                          : caseItem.status === "in_progress"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {caseItem.status === "open"
                        ? "Abierto"
                        : caseItem.status === "in_progress"
                          ? "En Progreso"
                          : "Cerrado"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(caseItem.created_at), "PPP", { locale: es })}</TableCell>
                  <TableCell>{format(new Date(caseItem.updated_at), "PPP", { locale: es })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
