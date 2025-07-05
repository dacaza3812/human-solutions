import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getInquiries } from "@/actions/inquiries"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default async function InquiriesPage() {
  const { inquiries, error } = await getInquiries()

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error al cargar las consultas: {error}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Consultas Recibidas</CardTitle>
          <CardDescription>Gestiona todas las consultas enviadas a través del formulario de contacto.</CardDescription>
        </CardHeader>
        <CardContent>
          {inquiries && inquiries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Archivo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell className="font-medium">
                      {inquiry.first_name} {inquiry.last_name}
                    </TableCell>
                    <TableCell>{inquiry.email}</TableCell>
                    <TableCell>{inquiry.phone || "N/A"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{inquiry.message}</TableCell>
                    <TableCell>
                      {inquiry.file_url ? (
                        <a
                          href={inquiry.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Ver Archivo
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={inquiry.status === "new" ? "default" : "secondary"}>{inquiry.status}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(inquiry.created_at), "PPP", { locale: es })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground">No hay consultas para mostrar.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
