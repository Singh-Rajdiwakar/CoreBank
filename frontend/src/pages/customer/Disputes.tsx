import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { recentTransfers } from '../../api/transfers'
import { listMyDisputes, createDispute, getDisputeTimeline } from '../../api/customer-disputes'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { errorMessage } from '../../lib/errorMessage'
import { formatCurrency, formatDateTime } from '../../lib/format'

export default function CustomerDisputesPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedTransactionRef, setSelectedTransactionRef] = useState('')
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [selectedDisputeId, setSelectedDisputeId] = useState<number | null>(null)

  const disputesQ = useQuery({
    queryKey: ['disputes', 'me'],
    queryFn: () => listMyDisputes({ page: 0, size: 50 }),
  })

  const transactionsQ = useQuery({
    queryKey: ['transfers', 'recent'],
    queryFn: recentTransfers,
  })

  const timelineQ = useQuery({
    enabled: selectedDisputeId != null,
    queryKey: ['disputes', 'timeline', selectedDisputeId],
    queryFn: () => {
      if (!selectedDisputeId) return Promise.resolve(null)
      return getDisputeTimeline(selectedDisputeId, { page: 0, size: 50 })
    },
  })

  const createM = useMutation({
    mutationFn: async () => {
      return createDispute({
        transactionReference: selectedTransactionRef,
        reason,
        description,
        amount: parseFloat(amount),
      })
    },
    onSuccess: () => {
      toast.success('Dispute raised successfully')
      resetForm()
      setShowForm(false)
      void disputesQ.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const resetForm = () => {
    setSelectedTransactionRef('')
    setReason('')
    setDescription('')
    setAmount('')
  }

  const disputes = disputesQ.data?.content ?? []
  const transactions = transactionsQ.data ?? []
  const isValid = selectedTransactionRef && reason && description && amount

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Customer</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Disputes</h1>
          <p className="mt-1 text-sm text-muted">Raise disputes for transactions and track resolutions.</p>
        </div>
        <Badge tone="neutral">{disputes.length} disputes</Badge>
      </header>

      {!showForm ? (
        <div className="surface p-6">
          <button
            type="button"
            className="rounded-lg bg-black/5 px-4 py-2 text-sm font-semibold hover:bg-black/10"
            onClick={() => setShowForm(true)}
          >
            Raise Dispute
          </button>
        </div>
      ) : (
        <div className="surface space-y-4 p-6">
          <div>
            <label className="text-sm font-semibold">Transaction *</label>
            <select
              className="mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
              value={selectedTransactionRef}
              onChange={(e) => {
                setSelectedTransactionRef(e.target.value)
                const txn = transactions.find((t) => t.referenceNumber === e.target.value)
                if (txn) {
                  setAmount(txn.amount.toString())
                }
              }}
            >
              <option value="">Select transaction</option>
              {transactions.map((t) => (
                <option key={t.id} value={t.referenceNumber}>
                  {t.referenceNumber} - {formatCurrency(t.amount, 'INR')} ({t.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold">Reason *</label>
            <select
              className="mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">Select reason</option>
              <option value="UNAUTHORIZED_TRANSACTION">Unauthorized Transaction</option>
              <option value="DUPLICATE_CHARGE">Duplicate Charge</option>
              <option value="INCORRECT_AMOUNT">Incorrect Amount</option>
              <option value="SERVICE_NOT_RENDERED">Service Not Rendered</option>
              <option value="REFUND_NOT_RECEIVED">Refund Not Received</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold">Description *</label>
            <textarea
              className="mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
              placeholder="Describe the issue in detail"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Amount *</label>
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!!selectedTransactionRef}
            />
          </div>

          <div className="flex gap-2">
            <Button
              disabled={!isValid || createM.isPending}
              onClick={() => createM.mutate()}
            >
              {createM.isPending ? <Spinner className="h-4 w-4" /> : 'Raise Dispute'}
            </Button>
            <button
              type="button"
              className="rounded-lg border border-black/10 px-4 py-2 text-sm font-semibold hover:bg-black/5"
              onClick={() => {
                setShowForm(false)
                resetForm()
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="surface p-6">
        {disputesQ.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Spinner /> Loading disputes...
          </div>
        ) : disputes.length ? (
          <div className="grid gap-4">
            {disputes.map((d) => (
              <div key={d.id} className="rounded-lg border border-black/10 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{d.disputeNumber}</p>
                    <p className="mt-1 text-xs text-muted">{d.transactionReference}</p>
                  </div>
                  <Badge tone={
                    d.status === 'RESOLVED' ? 'success' :
                    d.status === 'REJECTED' ? 'danger' :
                    d.status === 'ESCALATED' ? 'warning' :
                    'neutral'
                  }>
                    {d.status}
                  </Badge>
                </div>

                <div className="mt-3 space-y-1 text-sm">
                  <p className="text-muted">{d.description}</p>
                  <div className="flex justify-between">
                    <span className="text-muted">Amount</span>
                    <span className="font-semibold">{formatCurrency(d.amount, 'INR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Created</span>
                    <span className="text-xs">{formatDateTime(d.createdOn)}</span>
                  </div>
                  {d.slaDate && (
                    <div className="flex justify-between">
                      <span className="text-muted">SLA Date</span>
                      <span className="text-xs">{formatDateTime(d.slaDate)}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="mt-4 w-full rounded border border-blue-600 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                  onClick={() => setSelectedDisputeId(selectedDisputeId === d.id ? null : d.id)}
                >
                  {selectedDisputeId === d.id ? 'Hide Timeline' : 'View Timeline'}
                </button>

                {selectedDisputeId === d.id && (
                  <div className="mt-4 border-t border-black/10 pt-4">
                    {timelineQ.isLoading ? (
                      <p className="text-xs text-muted">Loading timeline...</p>
                    ) : timelineQ.data?.content ? (
                      <div className="space-y-2 text-xs">
                        {timelineQ.data.content.map((event: any, idx: number) => (
                          <div key={idx} className="flex gap-2">
                            <span className="font-semibold text-muted">•</span>
                            <div>
                              <p className="font-semibold">{event.action}</p>
                              <p className="text-xs text-muted">{formatDateTime(event.timestamp)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted">No timeline events</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No disputes raised yet.</p>
        )}
      </div>
    </div>
  )
}
