import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-server"

export default async function ClientCasesSection() {
  const supabase = createClient()
  const { data: cases, error } = await supabase.from("cases").select("*").limit(3) // Fetch a few recent cases

  if (error) {
    console.error("Error fetching client cases:", error)
    return <p>Error loading cases.</p>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Mis Casos Recientes</CardTitle>
        <Link href="/dashboard/cases">
          <Button variant="link" size="sm" className="text-emerald-500">
            Ver todos <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {cases.length === 0 ? (
          <p className="text-sm text-muted-foreground">No has iniciado ningún caso aún.</p>
        ) : (
          <ul className="space-y-3">
            {cases.map((caseItem) => (
              <li key={caseItem.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{caseItem.title}</p>
                  <p className="text-xs text-muted-foreground">Asesor: {caseItem.advisor_name || "N/A"}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    caseItem.status === "pending"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : caseItem.status === "active"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {caseItem.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
