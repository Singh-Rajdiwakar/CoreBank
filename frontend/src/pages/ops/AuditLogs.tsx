import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { listAuditLogs } from '../../api/audit'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import { Pagination } from '../../components/ui/Pagination'
import { Spinner } from '../../components/ui/Spinner'
import { formatDateTime } from '../../lib/format'

function toIsoStart(d?: string) {
  return d ? new Date(`${d}T00:00:00`).toISOString() : undefined
}

function toIsoEnd(d?: string) {
  return d ? new Date(`${d}T23:59:59`).toISOString() : undefined
}

export default function OpsAuditLogsPage() {
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [page, setPage] = useState(0)

  const range = useMemo(() => {
    return { from: toIsoStart(fromDate), to: toIsoEnd(toDate) }
  }, [fromDate, toDate])

  const q = useQuery({
    queryKey: ['audit', 'logs', range, page],
    queryFn: () => listAuditLogs({ ...range, page, size: 20 }),
  })

  const items = q.data?.content ?? []

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Audit</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Audit logs</h1>
          <p className="mt-1 text-sm text-muted">Read-only security trail.</p>
        </div>
        <Badge tone="neutral">{q.data?.totalElements ?? 0} events</Badge>
      </header>

      <div className="surface p-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs font-semibold text-muted">From</label>
            <div className="mt-2">
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value)
                  setPage(0)
                }}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted">To</label>
            <div className="mt-2">
              <Input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value)
                  setPage(0)
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-5">
          {q.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Spinner /> Loading audit logs...
            </div>
          ) : items.length ? (
            <div className="grid gap-3">
              {items.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-black/5 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {a.actionType} • {a.targetEntity}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Target ID: <span className="font-mono">{a.targetId ?? '—'}</span>
                    </p>
                    {a.remarks ? <p className="mt-1 text-xs text-muted">{a.remarks}</p> : null}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-muted">
                      {formatDateTime(a.actionAt)}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {a.success ? 'SUCCESS' : 'FAILED'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No audit events found.</p>
          )}
        </div>

        <div className="mt-6">
          <Pagination
            page={q.data?.page ?? 0}
            totalPages={q.data?.totalPages ?? 1}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>
    </div>
  )
}

