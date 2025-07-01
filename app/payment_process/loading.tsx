import { Skeleton } from "@/components/ui/skeleton"

export default function PaymentProcessLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md space-y-6">
        <Skeleton className="h-10 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}
