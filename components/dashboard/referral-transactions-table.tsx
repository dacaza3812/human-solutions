"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useTransition } from "react"
import { toggleReferralTransactionPaidStatus, type ReferralTransactionWithDetails } from "@/actions/referrals"
import { toast } from "@/components/ui/use-toast"

interface ReferralTransactionsTableProps {
  transactions: ReferralTransactionWithDetails[]
}

export function ReferralTransactionsTable({ transactions }: ReferralTransactionsTableProps) {
  const [isPending, startTransition] = useTransition()

  const handleTogglePaidStatus = async (transactionId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const result = await toggleReferralTransactionPaidStatus(transactionId, currentStatus)
      if (result.success) {
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
    })
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Referido</TableHead>
            <TableHead>Email del Referido</TableHead>
            <TableHead>Monto de Pago</TableHead>
            <TableHead>Fecha de Pago</TableHead>
            <TableHead>Porcentaje de Comisión</TableHead>
            <TableHead>Monto de Comisión</TableHead>
            <TableHead className="text-center">Pagado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No hay transacciones de referidos.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.referee_name}</TableCell>
                <TableCell>{transaction.referee_email}</TableCell>
                <TableCell>${transaction.payment_amount.toFixed(2)}</TableCell>
                <TableCell>{format(new Date(transaction.payment_date), "PPP", { locale: es })}</TableCell>
                <TableCell>{transaction.percentage}%</TableCell>
                <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    checked={transaction.paid}
                    onCheckedChange={() => handleTogglePaidStatus(transaction.id, transaction.paid)}
                    disabled={isPending}
                    aria-label={`Marcar transacción ${transaction.id} como ${transaction.paid ? "no pagada" : "pagada"}`}
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
