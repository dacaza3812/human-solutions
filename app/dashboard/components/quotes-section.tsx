import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase-server"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { DollarSign } from "lucide-react" // Declared DollarSign variable

export default async function QuotesSection() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <p>Por favor, inicia sesión para ver las cotizaciones.</p>
  }

  // Fetch quotes relevant to the user (either as client or advisor)
  const { data: quotes, error } = await supabase
    .from("quotes")
    .select("*, cases(id, title), client:client_id(name), advisor:advisor_id(name)")
    .or(`client_id.eq.${user.id},advisor_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(5) // Show only the 5 most recent quotes

  if (error) {
    console.error("Error fetching quotes:", error)
    return <p>Error al cargar las cotizaciones: {error.message}</p>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Últimas Cotizaciones</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <p className="text-muted-foreground">No hay cotizaciones recientes.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Caso</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Rol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/cases/${quote.case_id}`} className="text-emerald-400 hover:underline">
                      {quote.cases?.title || "N/A"}
                    </Link>
                  </TableCell>
                  <TableCell>${quote.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        quote.status === "pending" ? "secondary" : quote.status === "accepted" ? "default" : "outline"
                      }
                    >
                      {quote.status === "pending"
                        ? "Pendiente"
                        : quote.status === "accepted"
                          ? "Aceptada"
                          : "Rechazada"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(quote.created_at), "PPP", { locale: es })}</TableCell>
                  <TableCell>{quote.client_id === user.id ? "Cliente" : "Asesor"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Button variant="link" className="p-0 h-auto mt-4 text-emerald-400">
          Ver todas las cotizaciones <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  )
}
