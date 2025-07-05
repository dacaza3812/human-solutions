import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase-server"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react"
import { updateInquiryStatus } from "@/actions/inquiries"

export default async function InquiriesSection() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <p>Por favor, inicia sesión para ver las consultas.</p>
  }

  // Only advisors can see all inquiries
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || profile?.role !== "advisor") {
    return <p>No tienes permiso para ver esta sección.</p>
  }

  const { data: inquiries, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching inquiries:", error)
    return <p>Error al cargar las consultas: {error.message}</p>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas Consultas</CardTitle>
      </CardHeader>
      <CardContent>
        {inquiries.length === 0 ? (
          <p className="text-muted-foreground">No hay consultas nuevas en este momento.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell className="font-medium">{inquiry.name}</TableCell>
                  <TableCell>{inquiry.email}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{inquiry.message}</TableCell>
                  <TableCell>{format(new Date(inquiry.created_at), "PPP", { locale: es })}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        inquiry.status === "pending"
                          ? "secondary"
                          : inquiry.status === "resolved"
                            ? "default"
                            : "outline"
                      }
                    >
                      {inquiry.status === "pending"
                        ? "Pendiente"
                        : inquiry.status === "resolved"
                          ? "Resuelta"
                          : "Archivada"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <form action={updateInquiryStatus}>
                      <input type="hidden" name="id" value={inquiry.id} />
                      <input type="hidden" name="currentStatus" value={inquiry.status} />
                      {inquiry.status === "pending" && (
                        <Button
                          type="submit"
                          name="status"
                          value="resolved"
                          variant="ghost"
                          size="sm"
                          className="text-green-500 hover:text-green-600"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="sr-only">Marcar como Resuelta</span>
                        </Button>
                      )}
                      {inquiry.status === "resolved" && (
                        <Button
                          type="submit"
                          name="status"
                          value="archived"
                          variant="ghost"
                          size="sm"
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <ArrowRight className="h-4 w-4" />
                          <span className="sr-only">Archivar</span>
                        </Button>
                      )}
                      {inquiry.status !== "archived" && (
                        <Button
                          type="submit"
                          name="status"
                          value="archived"
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                        >
                          <XCircle className="h-4 w-4" />
                          <span className="sr-only">Archivar</span>
                        </Button>
                      )}
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
