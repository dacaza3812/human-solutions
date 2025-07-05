import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-server"

export default async function QuotesSection() {
  const supabase = createClient()
  // In a real app, you'd fetch quotes relevant to the user/advisor
  const { data: quotes, error } = await supabase.from("quotes").select("*").limit(3)

  if (error) {
    console.error("Error fetching quotes:", error)
    return <p>Error loading quotes.</p>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Cotizaciones Pendientes</CardTitle>
        <Link href="/dashboard/quotes">
          <Button variant="link" size="sm" className="text-emerald-500">
            Ver todas <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay cotizaciones pendientes.</p>
        ) : (
          <ul className="space-y-3">
            {quotes.map((quote) => (
              <li key={quote.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{quote.title}</p>
                  <p className="text-xs text-muted-foreground">Cliente: {quote.client_name || "N/A"}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    quote.status === "pending"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : quote.status === "approved"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {quote.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
