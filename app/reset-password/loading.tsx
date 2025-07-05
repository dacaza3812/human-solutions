import { Loader2 } from "lucide-react"

export default function ResetPasswordLoading() {
  return (
    <div className="flex items-center justify-center h-full min-h-[calc(100vh-60px)]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Cargando página de restablecimiento de contraseña...</span>
    </div>
  )
}
