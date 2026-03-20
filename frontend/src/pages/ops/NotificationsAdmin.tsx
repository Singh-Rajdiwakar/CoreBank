import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import type { NotificationChannel, NotificationStatus } from '../../api/notificationsAdmin'
import {
  cleanupSent,
  exportDeadLetterCsv,
  queueByStatus,
  queueSummary,
  retryDispatch,
} from '../../api/notificationsAdmin'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Pagination } from '../../components/ui/Pagination'
import { Spinner } from '../../components/ui/Spinner'
import { errorMessage } from '../../lib/errorMessage'
import { formatDateTime } from '../../lib/format'

const STATUSES: NotificationStatus[] = ['PENDING', 'FAILED', 'SENT']
const CHANNELS: Array<NotificationChannel | 'ALL'> = ['ALL', 'EMAIL', 'SMS', 'IN_APP']

export default function OpsNotificationsAdminPage() {
  const [status, setStatus] = useState<NotificationStatus>('PENDING')
  const [page, setPage] = useState(0)
  const [channel, setChannel] = useState<NotificationChannel | 'ALL'>('ALL')
  const [dlqLimit, setDlqLimit] = useState('1000')

  const sumQ = useQuery({
    queryKey: ['notifications', 'admin', 'summary'],
    queryFn: queueSummary,
  })

  const listQ = useQuery({
    queryKey: ['notifications', 'admin', 'queue', status, page],
    queryFn: () => queueByStatus(status, { page, size: 50 }),
  })

  const retryM = useMutation({
    mutationFn: async () => retryDispatch(channel === 'ALL' ? undefined : channel),
    onSuccess: () => {
      toast.success('Retry requested')
      void sumQ.refetch()
      void listQ.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const cleanupM = useMutation({
    mutationFn: cleanupSent,
    onSuccess: () => {
      toast.success('Cleanup completed')
      void sumQ.refetch()
      void listQ.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const dlqParams = useMemo(() => {
    const limit = Number(dlqLimit)
    return {
      channel: channel === 'ALL' ? undefined : channel,
      limit: Number.isFinite(limit) ? limit : 1000,
    }
  }, [channel, dlqLimit])

  async function downloadDlq() {
    try {
      const blob = await exportDeadLetterCsv(dlqParams)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dead-letter-${dlqParams.channel ?? 'ALL'}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('CSV downloaded')
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  const items = listQ.data?.content ?? []

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Admin</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Notification queue</h1>
          <p className="mt-1 text-sm text-muted">
            Queue, dead-letter export, and retry-dispatch.
          </p>
        </div>
        <Badge tone="neutral">
          pending {sumQ.data?.pendingCount ?? 0} • failed {sumQ.data?.failedCount ?? 0}
        </Badge>
      </header>

      <section className="grid gap-4 lg:grid-cols-4">
        <div className="surface p-5">
          <p className="text-xs font-semibold text-muted">Pending</p>
          <p className="mt-2 font-display text-2xl font-semibold">
            {sumQ.isLoading ? '—' : String(sumQ.data?.pendingCount ?? 0)}
          </p>
        </div>
        <div className="surface p-5">
          <p className="text-xs font-semibold text-muted">Failed</p>
          <p className="mt-2 font-display text-2xl font-semibold">
            {sumQ.isLoading ? '—' : String(sumQ.data?.failedCount ?? 0)}
          </p>
        </div>
        <div className="surface p-5">
          <p className="text-xs font-semibold text-muted">Sent</p>
          <p className="mt-2 font-display text-2xl font-semibold">
            {sumQ.isLoading ? '—' : String(sumQ.data?.sentCount ?? 0)}
          </p>
        </div>
        <div className="surface p-5">
          <p className="text-xs font-semibold text-muted">Due retry</p>
          <p className="mt-2 font-display text-2xl font-semibold">
            {sumQ.isLoading ? '—' : String(sumQ.data?.dueRetryCount ?? 0)}
          </p>
        </div>
      </section>

      <section className="surface p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Admin actions</h2>
            <p className="text-sm text-muted">Retry dispatch, cleanup, and DLQ export.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-11 rounded-lg bg-white px-3 text-sm font-semibold ring-1 ring-black/10"
              value={channel}
              onChange={(e) => setChannel(e.target.value as NotificationChannel | 'ALL')}
            >
              {CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => retryM.mutate()}
              disabled={retryM.isPending}
            >
              Retry dispatch
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => cleanupM.mutate()}
              disabled={cleanupM.isPending}
            >
              Cleanup sent
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <label className="text-xs font-semibold text-muted">Dead-letter export limit</label>
            <div className="mt-2">
              <Input
                type="number"
                min={1}
                value={dlqLimit}
                onChange={(e) => setDlqLimit(e.target.value)}
              />
            </div>
          </div>
          <Button type="button" onClick={downloadDlq}>
            Download DLQ CSV
          </Button>
        </div>
      </section>

      <section className="surface p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Queue</h2>
            <p className="text-sm text-muted">Browse by status</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                className={
                  'rounded-lg px-3 py-2 text-sm font-semibold ring-1 ring-black/10 ' +
                  (s === status ? 'bg-primary text-white' : 'bg-white hover:bg-black/5')
                }
                onClick={() => {
                  setStatus(s)
                  setPage(0)
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {listQ.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Spinner /> Loading queue...
            </div>
          ) : items.length ? (
            <div className="grid gap-3">
              {items.map((n) => (
                <div
                  key={n.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-black/5 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {n.channel} • {n.type}
                    </p>
                    <p className="mt-1 text-xs text-muted">{n.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      Attempts: {n.attemptCount ?? 0}
                      {n.lastError ? ` • ${n.lastError}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-muted">{n.status}</p>
                    <p className="mt-1 text-xs text-muted">
                      {formatDateTime(n.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No queue items.</p>
          )}
        </div>

        <div className="mt-6">
          <Pagination
            page={listQ.data?.page ?? 0}
            totalPages={listQ.data?.totalPages ?? 1}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </section>
    </div>
  )
}

