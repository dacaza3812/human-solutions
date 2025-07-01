import { Skeleton } from "@/components/ui/skeleton"

export default function ResetPasswordLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-10 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}
