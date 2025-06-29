import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Target, TestTube, X } from "lucide-react"

export default function TestPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Sección de Prueba</h2>
          <p className="text-muted-foreground">Esta es una página de prueba para testing</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          <TestTube className="w-4 h-4 mr-2" />
          Ejecutar Prueba
        </Button>
      </div>

      {/* Test Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pruebas Totales</CardTitle>
            <TestTube className="h-8 w-8 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground mt-2">+12% desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pruebas Exitosas</CardTitle>
            <Target className="h-8 w-8 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground mt-2">91% tasa de éxito</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pruebas Fallidas</CardTitle>
            <X className="h-8 w-8 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground mt-2">9% tasa de fallo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Calendar className="h-8 w-8 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3s</div>
            <p className="text-xs text-muted-foreground mt-2">-0.2s mejora</p>
          </CardContent>
        </Card>
      </div>

      {/* Test History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Pruebas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: 1, name: "Test de Autenticación", status: "Exitoso", time: "1.2s", date: "Hace 5 min" },
              { id: 2, name: "Test de Base de Datos", status: "Exitoso", time: "2.8s", date: "Hace 10 min" },
              { id: 3, name: "Test de API", status: "Fallido", time: "5.1s", date: "Hace 15 min" },
              { id: 4, name: "Test de UI", status: "Exitoso", time: "1.9s", date: "Hace 20 min" },
            ].map((test) => (
              <div key={test.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full ${test.status === "Exitoso" ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <span className="font-medium">{test.name}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{test.time}</span>
                  <span>{test.date}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      test.status === "Exitoso"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {test.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
