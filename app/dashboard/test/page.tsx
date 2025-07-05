"use client"
import { TestTube, Clock, CheckCircle, AlertCircle } from "lucide-react"

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
    <div className="p-4 md:p-6">
      <h1>Test Page</h1>
      <p>This is a test page for development purposes.</p>
    </div>
  )
}
