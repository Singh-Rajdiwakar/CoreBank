import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { pendingTransfers } from '../../api/manager'
import { approveTransfer, rejectTransfer } from '../../api/transfers'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { errorMessage } from '../../lib/errorMessage'
import { formatCurrency, formatDateTime } from '../../lib/format'

export default function OpsApprovalsTransfersPage() {
  const [remarks, setRemarks] = useState<Record<number, string>>({})

  const q = useQuery({
    queryKey: ['manager', 'transfers', 'pending'],
    queryFn: pendingTransfers,
  })

  const approveM = useMutation({
    mutationFn: async (id: number) => approveTransfer(id, remarks[id] ?? 'Approved'),
    onSuccess: () => {
      toast.success('Transfer approved')
      void q.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const rejectM = useMutation({
    mutationFn: async (id: number) => rejectTransfer(id, remarks[id] ?? 'Rejected'),
    onSuccess: () => {
      toast.success('Transfer rejected')
      void q.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Manager / Admin</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Transfer approvals</h1>
          <p className="mt-1 text-sm text-muted">
            Maker-checker queue from `/api/manager/transfers/pending`.
          </p>
        </div>
        <Badge tone="neutral">{q.data?.length ?? 0} pending</Badge>
      </header>

      <div className="surface p-6">
        {q.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Spinner /> Loading pending transfers...
          </div>
        ) : q.data?.length ? (
          <div className="grid gap-3">
            {q.data.map((t) => (
              <div key={t.id} className="rounded-xl bg-black/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {t.transactionType} • {t.referenceNumber}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {t.sourceAccountNumber}
                      {t.destinationAccountNumber ? ` → ${t.destinationAccountNumber}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-muted">{formatDateTime(t.initiatedAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(t.amount)}</p>
                    <p className="mt-1 text-xs text-muted">{t.status}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
                  <Input
                    placeholder="Remark (optional)"
                    value={remarks[t.id] ?? ''}
                    onChange={(e) =>
                      setRemarks((s) => ({ ...s, [t.id]: e.target.value }))
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => approveM.mutate(t.id)}
                      disabled={approveM.isPending || rejectM.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => rejectM.mutate(t.id)}
                      disabled={approveM.isPending || rejectM.isPending}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No pending transfers.</p>
        )}
      </div>
    </div>
  )
}

