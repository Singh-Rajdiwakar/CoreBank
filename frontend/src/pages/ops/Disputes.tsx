import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import type { DisputeStatus } from '../../api/disputes'
import { disputeTimeline, disputesOpsQueue, disputesSummary } from '../../api/disputes'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Pagination } from '../../components/ui/Pagination'
import { Spinner } from '../../components/ui/Spinner'
import { formatDateTime } from '../../lib/format'

const STATUSES: Array<DisputeStatus | 'ALL'> = [
  'ALL',
  'OPEN',
  'EVIDENCE_REQUIRED',
  'UNDER_REVIEW',
  'ESCALATED',
  'RESOLVED',
  'REJECTED',
  'CLOSED',
]

export default function OpsDisputesPage() {
  const [status, setStatus] = useState<DisputeStatus | 'ALL'>('ALL')
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [page, setPage] = useState(0)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const sumQ = useQuery({
    queryKey: ['disputes', 'ops', 'summary'],
    queryFn: disputesSummary,
  })

  const listQ = useQuery({
    queryKey: ['disputes', 'ops', 'queue', { status, overdueOnly, page }],
    queryFn: () =>
      disputesOpsQueue({
        status: status === 'ALL' ? undefined : status,
        overdueOnly,
        page,
        size: 50,
      }),
  })

  const timelineQ = useQuery({
    enabled: selectedId != null,
    queryKey: ['disputes', 'timeline', selectedId],
    queryFn: () => disputeTimeline(selectedId!, { page: 0, size: 50 }),
  })

  const items = listQ.data?.content ?? []

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Ops</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Disputes</h1>
          <p className="mt-1 text-sm text-muted">
            Chargeback simulation with evidence + timeline.
          </p>
        </div>
        <Badge tone="neutral">{listQ.data?.totalElements ?? 0} cases</Badge>
      </header>

      <section className="grid gap-4 lg:grid-cols-6">
        <div className="surface p-5">
          <p className="text-xs font-semibold text-muted">Open</p>
          <p className="mt-2 font-display text-2xl font-semibold">
            {sumQ.isLoading ? '—' : String(sumQ.data?.openCount ?? 0)}
          </p>
        </div>
        <div className="surface p-5">
          <p className="text-xs font-semibold text-muted">Under review</p>
          <p className="mt-2 font-display text-2xl font-semibold">
            {sumQ.isLoading ? '—' : String(sumQ.data?.underReviewCount ?? 0)}
          </p>
        </div>
        <div className="surface p-5">
          <p className="text-xs font-semibold text-muted">Escalated</p>
          <p className="mt-2 font-display text-2xl font-semibold">
            {sumQ.isLoading ? '—' : String(sumQ.data?.escalatedCount ?? 0)}
          </p>
        </div>
        <div className="surface p-5">
          <p className="text-xs font-semibold text-muted">Resolved</p>
          <p className="mt-2 font-display text-2xl font-semibold">
            {sumQ.isLoading ? '—' : String(sumQ.data?.resolvedCount ?? 0)}
          </p>
        </div>
        <div className="surface p-5">
          <p className="text-xs font-semibold text-muted">Rejected</p>
          <p className="mt-2 font-display text-2xl font-semibold">
            {sumQ.isLoading ? '—' : String(sumQ.data?.rejectedCount ?? 0)}
          </p>
        </div>
        <div className="surface p-5">
          <p className="text-xs font-semibold text-muted">Closed</p>
          <p className="mt-2 font-display text-2xl font-semibold">
            {sumQ.isLoading ? '—' : String(sumQ.data?.closedCount ?? 0)}
          </p>
        </div>
      </section>

      <section className="surface p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Operations queue</h2>
            <p className="text-sm text-muted">Filter by status and overdue flag.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-11 rounded-lg bg-white px-3 text-sm font-semibold ring-1 ring-black/10"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as DisputeStatus | 'ALL')
                setPage(0)
              }}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={overdueOnly}
                onChange={(e) => {
                  setOverdueOnly(e.target.checked)
                  setPage(0)
                }}
              />
              Overdue only
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_420px]">
          <div>
            {listQ.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Spinner /> Loading disputes...
              </div>
            ) : items.length ? (
              <div className="grid gap-3">
                {items.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={
                      'rounded-xl bg-black/5 p-4 text-left hover:bg-black/10 ' +
                      (selectedId === d.id ? 'ring-2 ring-primary/40' : 'ring-1 ring-black/5')
                    }
                    onClick={() => setSelectedId(d.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          {d.caseNumber} • {d.status}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {d.category} • {d.priority}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          Txn:{' '}
                          <span className="font-mono">
                            {d.transactionReference ?? d.transactionId}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-muted">
                          {formatDateTime(d.reportedAt)}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          due: {formatDateTime(d.resolutionDueAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No disputes found.</p>
            )}

            <div className="mt-6">
              <Pagination
                page={listQ.data?.page ?? 0}
                totalPages={listQ.data?.totalPages ?? 1}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </div>

          <div className="rounded-xl bg-black/5 p-4">
            <p className="text-xs font-semibold text-muted">Timeline</p>
            <p className="mt-1 text-sm text-muted">
              Select a case to load its dispute timeline (audit trail).
            </p>

            <div className="mt-4">
              {!selectedId ? (
                <p className="text-sm text-muted">No case selected.</p>
              ) : timelineQ.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Spinner /> Loading timeline...
                </div>
              ) : timelineQ.data?.content?.length ? (
                <div className="grid gap-2">
                  {timelineQ.data.content.slice(0, 12).map((e) => (
                    <div key={e.id} className="rounded-lg bg-white p-3 ring-1 ring-black/10">
                      <p className="text-xs font-semibold">{e.actionType}</p>
                      <p className="mt-1 text-xs text-muted">{formatDateTime(e.actionAt)}</p>
                      {e.remarks ? (
                        <p className="mt-1 text-xs text-muted">{e.remarks}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No timeline events.</p>
              )}

              {selectedId ? (
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => timelineQ.refetch()}
                  >
                    Refresh timeline
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

