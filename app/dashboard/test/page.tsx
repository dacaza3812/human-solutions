"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TestTube,
  Play,
  Settings,
  FileText,
  Target,
  X,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  RefreshCw,
} from "lucide-react"

export default function TestPage() {
  const testStats = [
    {
      title: "Pruebas Totales",
      value: "156",
      change: "+12%",
      icon: TestTube,
      color: "text-emerald-500",
    },
    {
      title: "Pruebas Exitosas",
      value: "142",
      change: "91%",
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: "Pruebas Fallidas",
      value: "14",
      change: "9%",
      icon: AlertCircle,
      color: "text-red-500",
    },
    {
      title: "Tiempo Promedio",
      value: "2.3s",
      change: "-0.2s",
      icon: Clock,
      color: "text-blue-500",
    },
  ]

  const testHistory = [
    {
      id: 1,
      name: "Test de Autenticación",
      status: "Exitoso",
      time: "1.2s",
      date: "Hace 5 min",
      progress: 100,
    },
    {
      id: 2,
      name: "Test de Base de Datos",
      status: "Exitoso",
      time: "2.8s",
      date: "Hace 10 min",
      progress: 100,
    },
    {
      id: 3,
      name: "Test de API Externa",
      status: "Fallido",
      time: "5.1s",
      date: "Hace 15 min",
      progress: 45,
    },
    {
      id: 4,
      name: "Test de UI Components",
      status: "Exitoso",
      time: "1.9s",
      date: "Hace 20 min",
      progress: 100,
    },
    {
      id: 5,
      name: "Test de Integración",
      status: "En Progreso",
      time: "3.2s",
      date: "Hace 25 min",
      progress: 75,
    },
  ]

  const testSuites = [
    {
      name: "Suite de Autenticación",
      tests: 24,
      passed: 22,
      failed: 2,
      duration: "45s",
    },
    {
      name: "Suite de Base de Datos",
      tests: 18,
      passed: 18,
      failed: 0,
      duration: "32s",
    },
    {
      name: "Suite de API",
      tests: 35,
      passed: 31,
      failed: 4,
      duration: "78s",
    },
    {
      name: "Suite de UI",
      tests: 42,
      passed: 40,
      failed: 2,
      duration: "56s",
    },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Centro de Pruebas</h1>
          <p className="text-muted-foreground mt-1">Monitorea y ejecuta pruebas del sistema</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            <Play className="w-4 h-4 mr-2" />
            Ejecutar Todas las Pruebas
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testStats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change} desde la última ejecución</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="history" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history">Historial</TabsTrigger>
            <TabsTrigger value="suites">Suites de Prueba</TabsTrigger>
            <TabsTrigger value="config">Configuración</TabsTrigger>
          </TabsList>

          {/* Test History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Historial de Pruebas Recientes
                </CardTitle>
                <CardDescription>Resultados de las últimas pruebas ejecutadas en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testHistory.map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {test.status === "Exitoso" && <CheckCircle className="w-5 h-5 text-green-500" />}
                          {test.status === "Fallido" && <AlertCircle className="w-5 h-5 text-red-500" />}
                          {test.status === "En Progreso" && (
                            <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                          )}
                          <Badge
                            variant={
                              test.status === "Exitoso"
                                ? "default"
                                : test.status === "Fallido"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className={test.status === "Exitoso" ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {test.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-medium">{test.name}</p>
                          <p className="text-sm text-muted-foreground">{test.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{test.time}</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={test.progress} className="w-16 h-2" />
                            <span className="text-xs text-muted-foreground">{test.progress}%</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Suites Tab */}
          <TabsContent value="suites" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {testSuites.map((suite, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{suite.name}</span>
                      <Badge variant="outline">{suite.tests} tests</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">{suite.passed}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <X className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium">{suite.failed}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{suite.duration}</span>
                      </div>
                    </div>
                    <Progress value={(suite.passed / suite.tests) * 100} className="h-2" />
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <Play className="w-4 h-4 mr-1" />
                        Ejecutar
                      </Button>
                      <Button variant="ghost" size="sm">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración General</CardTitle>
                  <CardDescription>Ajustes globales para la ejecución de pruebas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Ejecución Automática</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Activado
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Notificaciones</span>
                    <Badge variant="outline">Solo Fallos</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Timeout por Prueba</span>
                    <Badge variant="outline">30s</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Reintentos Automáticos</span>
                    <Badge variant="outline">3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Paralelización</span>
                    <Badge variant="outline">4 hilos</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                  <CardDescription>Herramientas y configuraciones adicionales</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Settings className="mr-2 h-4 w-4" />
                    Configurar Entornos
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <FileText className="mr-2 h-4 w-4" />
                    Generar Reporte
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Target className="mr-2 h-4 w-4" />
                    Configurar Cobertura
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Calendar className="mr-2 h-4 w-4" />
                    Programar Ejecuciones
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Ver Métricas Históricas
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
