"use client"

import { useEffect, useState, useTransition } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { getReferralTransactions, toggleReferralTransactionPaidStatus } from "@/actions/referrals"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface ReferralTransaction {
  id: string
  referrer_id: string
  referee_id: string
  payment_id: string
  percentage: number
  amount: number
  created_at: string
  paid: boolean
  referee_email: string
  referrer_email: string
  referee_name: string
}

interface ReferralTransactionsTableProps {
  advisorId: string
}

export function ReferralTransactionsTable({ advisorId }: ReferralTransactionsTableProps) {
  const [transactions, setTransactions] = useState<ReferralTransaction[]>([])
  const [isLoading, startTransition] = useTransition()

  useEffect(() => {
    if (advisorId) {
      startTransition(async () => {
        const data = await getReferralTransactions(advisorId)
        setTransactions(data)
      })
    }
  }, [advisorId])

  const handleTogglePaidStatus = async (transactionId: string, currentStatus: boolean) => {
    const result = await toggleReferralTransactionPaidStatus(transactionId, currentStatus)
    if (result.success) {
      setTransactions((prev) => prev.map((t) => (t.id === transactionId ? { ...t, paid: !currentStatus } : t)))
      toast({
        title: "Estado actualizado",
        description: result.message,
      })
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Referido</TableHead>
            <TableHead>Email del Referido</TableHead>
            <TableHead>Email del Usuario que Refirió</TableHead>
            <TableHead>Monto a pagar</TableHead>
            <TableHead>Porcentaje</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-center">Pagado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                No hay transacciones de referidos para mostrar.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.referee_name}</TableCell>
                <TableCell>{transaction.referee_email}</TableCell>
                <TableCell>{transaction.referrer_email}</TableCell>
                <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                <TableCell>{transaction.percentage}%</TableCell>
                <TableCell>{format(new Date(transaction.created_at), "dd/MM/yyyy")}</TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={transaction.paid}
                    onCheckedChange={() => handleTogglePaidStatus(transaction.id, transaction.paid)}
                    aria-label={`Toggle paid status for transaction ${transaction.id}`}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
