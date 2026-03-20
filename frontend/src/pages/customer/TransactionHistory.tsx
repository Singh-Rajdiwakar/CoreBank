import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { recentTransfers } from '../../api/transfers'
import { Badge } from '../../components/ui/Badge'
import { Pagination } from '../../components/ui/Pagination'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency, formatDateTime } from '../../lib/format'

export default function CustomerTransactionHistoryPage() {
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED'>('ALL')

  const q = useQuery({
    queryKey: ['transfers', 'recent', { page, statusFilter }],
    queryFn: recentTransfers, // Note: This doesn't support pagination/filtering in the current API
  })

  const transactions = q.data ?? []
  const filtered = statusFilter === 'ALL' 
    ? transactions 
    : transactions.filter(t => t.status === statusFilter)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Customer</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Transaction History</h1>
          <p className="mt-1 text-sm text-muted">View all your transactions and transfers.</p>
        </div>
      </header>

      <div className="surface p-6">
        <div className="mb-4 flex gap-2">
          {(['ALL', 'SUCCESS', 'PENDING', 'FAILED'] as const).map((status) => (
            <button
              key={status}
              type="button"
              className={`rounded px-3 py-1 text-sm font-semibold transition ${
                statusFilter === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-black/5 hover:bg-black/10'
              }`}
              onClick={() => {
                setStatusFilter(status)
                setPage(0)
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {q.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Spinner /> Loading transactions...
          </div>
        ) : filtered.length ? (
          <div className="space-y-2">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="flex flex-col items-start justify-between gap-3 rounded-lg bg-black/5 p-4 md:flex-row md:items-center"
              >
                <div className="flex-1">
                  <p className="font-semibold">{t.referenceNumber}</p>
                  <p className="mt-1 text-xs text-muted">
                    {t.sourceAccountNumber}
                    {t.destinationAccountNumber && ` → ${t.destinationAccountNumber}`}
                  </p>
                  <p className="mt-1 text-xs text-muted">{formatDateTime(t.initiatedAt)}</p>
                  {t.description && (
                    <p className="mt-1 text-xs text-muted italic">{t.description}</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div>
                    <p className="font-semibold">{formatCurrency(t.amount, 'INR')}</p>
                    <p className="text-xs text-muted">
                      {t.charges && `+ ${formatCurrency(t.charges, 'INR')} charges`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {t.approvalRequired && (
                      <Badge tone="warning">Pending Approval</Badge>
                    )}
                    <Badge
                      tone={
                        t.status === 'SUCCESS'
                          ? 'success'
                          : t.status === 'PENDING'
                            ? 'warning'
                            : 'danger'
                      }
                    >
                      {t.status}
                    </Badge>
                  </div>

                  {t.fraudScore && t.fraudScore > 0 && (
                    <Badge tone="danger">Fraud Score: {t.fraudScore}</Badge>
                  )}
                </div>
              </div>
            ))}

            {transactions.length > 10 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  page={page}
                  total={Math.ceil(transactions.length / 10)}
                  onChange={setPage}
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">No transactions found.</p>
        )}
      </div>
    </div>
  )
}
