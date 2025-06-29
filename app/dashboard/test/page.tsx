"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TestTube, Play, Settings, FileText } from "lucide-react"

export default function TestPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Prueba</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <Play className="mr-2 h-4 w-4" />
            Ejecutar Prueba
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pruebas Totales</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 desde la última semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pruebas Exitosas</CardTitle>
            <Badge variant="default" className="bg-green-500">
              ✓
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">75% de éxito</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pruebas Fallidas</CardTitle>
            <Badge variant="destructive">✗</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">25% de fallos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4s</div>
            <p className="text-xs text-muted-foreground">-0.3s desde ayer</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Historial de Pruebas</CardTitle>
            <CardDescription>Resultados de las últimas pruebas ejecutadas</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              {[
                { name: "Prueba de Autenticación", status: "success", time: "2.1s", date: "Hace 5 min" },
                { name: "Prueba de Base de Datos", status: "success", time: "1.8s", date: "Hace 12 min" },
                { name: "Prueba de API Externa", status: "failed", time: "5.2s", date: "Hace 25 min" },
                { name: "Prueba de Validación", status: "success", time: "0.9s", date: "Hace 1 hora" },
                { name: "Prueba de Integración", status: "success", time: "3.1s", date: "Hace 2 horas" },
              ].map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={test.status === "success" ? "default" : "destructive"}
                      className={test.status === "success" ? "bg-green-500" : ""}
                    >
                      {test.status === "success" ? "✓" : "✗"}
                    </Badge>
                    <div>
                      <p className="font-medium">{test.name}</p>
                      <p className="text-sm text-muted-foreground">{test.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{test.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Configuración de Pruebas</CardTitle>
            <CardDescription>Ajustes y parámetros de las pruebas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ejecución Automática</span>
                <Badge variant="outline">Activado</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Notificaciones</span>
                <Badge variant="outline">Solo Fallos</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Timeout</span>
                <Badge variant="outline">30s</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Reintentos</span>
                <Badge variant="outline">3</Badge>
              </div>

              <div className="pt-4">
                <Button variant="outline" className="w-full bg-transparent">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurar Pruebas
                </Button>
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full bg-transparent">
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Reportes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
