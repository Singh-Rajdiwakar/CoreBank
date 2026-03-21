import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { getAccountStatement, type AccountResponse } from '../../api/accounts'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency, formatDate } from '../../lib/format'
import { useCustomerAccounts } from '../../lib/hooks'

export default function AccountStatementPage() {
  const accounts = useCustomerAccounts()
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const statementQ = useQuery({
    queryKey: ['statement', selectedAccount, { fromDate, toDate }],
    queryFn: () =>
      getAccountStatement(selectedAccount, {
        from: fromDate || undefined,
        to: toDate || undefined,
        page: 0,
        size: 100,
      }),
    enabled: !!selectedAccount,
  })

  const transactions = statementQ.data?.content ?? []

  return (
    <div className="space-y-5">
      <header>
        <p className="chip">Customer</p>
        <h1 className="mt-3 font-display text-2xl font-semibold">Account Statement</h1>
        <p className="mt-1 text-sm text-muted">View detailed transaction history</p>
      </header>

      <div className="surface p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="select-account" className="block text-xs font-semibold mb-2">Select Account</label>
            <select
              id="select-account"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="input w-full"
            >
              <option value="">Choose an account...</option>
              {accounts.map((a: AccountResponse) => (
                <option key={a.accountNumber} value={a.accountNumber}>
                  {a.accountNumber} • {a.accountType}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="from-date" className="block text-xs font-semibold mb-2">From Date</label>
            <input
              id="from-date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input w-full"
            />
          </div>
          <div>
            <label htmlFor="to-date" className="block text-xs font-semibold mb-2">To Date</label>
            <input
              id="to-date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input w-full"
            />
          </div>
        </div>

        {selectedAccount && (
          <div>
            <Button
              onClick={() => statementQ.refetch()}
              disabled={statementQ.isLoading}
              className="gap-2"
            >
              {statementQ.isLoading && <Spinner className="h-4 w-4" />}
              Generate Statement
            </Button>
          </div>
        )}
      </div>

      {statementQ.isLoading ? (
        <div className="surface p-6 flex items-center gap-2 text-sm text-muted">
          <Spinner /> Loading statement...
        </div>
      ) : transactions.length ? (
        <div className="surface p-6 space-y-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Transactions</h2>
            <Badge tone="neutral">{transactions.length} transactions</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-left py-2 px-2">Reference</th>
                  <th className="text-left py-2 px-2">Type</th>
                  <th className="text-left py-2 px-2">Description</th>
                  <th className="text-right py-2 px-2">Amount</th>
                  <th className="text-right py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-black/5">
                    <td className="py-2 px-2">{formatDate(t.initiatedAt)}</td>
                    <td className="py-2 px-2 font-mono text-xs">{t.referenceNumber}</td>
                    <td className="py-2 px-2">
                      <Badge tone="neutral">{t.transactionType}</Badge>
                    </td>
                    <td className="py-2 px-2 text-muted">{t.description}</td>
                    <td className="py-2 px-2 text-right font-semibold">
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <Badge
                        tone={
                          t.status === 'COMPLETED'
                            ? 'success'
                            : t.status === 'FAILED'
                              ? 'danger'
                              : 'neutral'
                        }
                      >
                        {t.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : selectedAccount ? (
        <div className="surface p-6 text-center text-sm text-muted">
          No transactions found for the selected period
        </div>
      ) : null}
    </div>
  )
}
