import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import {
  adminDashboardReport,
  branchPerformance,
  dailyVolume,
  highValueTransactions,
  revenueReport,
} from '../../api/admin'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency } from '../../lib/format'

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

export default function OpsReportsPage() {
  const [date, setDate] = useState(() => todayIsoDate())
  const [threshold, setThreshold] = useState('100000')
  const [limit, setLimit] = useState('20')

  const dashQ = useQuery({
    queryKey: ['admin', 'reports', 'dashboard'],
    queryFn: adminDashboardReport,
  })

  const dailyQ = useQuery({
    queryKey: ['admin', 'reports', 'daily-volume', date],
    queryFn: () => dailyVolume(date),
  })

  const revenueQ = useQuery({
    queryKey: ['admin', 'reports', 'revenue'],
    queryFn: revenueReport,
  })

  const branchPerfQ = useQuery({
    queryKey: ['admin', 'reports', 'branch-performance'],
    queryFn: branchPerformance,
  })

  const hvParams = useMemo(() => {
    const t = Number(threshold)
    const l = Number(limit)
    return {
      threshold: Number.isFinite(t) ? t : 100000,
      limit: Number.isFinite(l) ? l : 20,
    }
  }, [threshold, limit])

  const highValueQ = useQuery({
    queryKey: ['admin', 'reports', 'high-value', hvParams],
    queryFn: () => highValueTransactions(hvParams),
  })

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Admin / Auditor</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Reports</h1>
          <p className="mt-1 text-sm text-muted">
            Live data from `/api/admin/reports/*`.
          </p>
        </div>
        <a
          className="text-sm font-semibold text-primary underline"
          href="http://localhost:8080/swagger-ui/index.html"
          target="_blank"
          rel="noreferrer"
        >
          Swagger
        </a>
      </header>

      <section className="grid gap-4 lg:grid-cols-4">
        <div className="surface p-5">
          <p className="text-xs font-semibold text-muted">Total customers</p>
          <p className="mt-2 font-display text-2xl font-semibold">
            {dashQ.isLoading ? '—' : String(dashQ.data?.totalCustomers ?? 0)}
          </p>
        </div>
        <div className="surface p-5">
          <p className="text-xs font-semibold text-muted">Active accounts</p>
          <p className="mt-2 font-display text-2xl font-semibold">
            {dashQ.isLoading ? '—' : String(dashQ.data?.totalActiveAccounts ?? 0)}
          </p>
        </div>
        <div className="surface p-5">
          <p className="text-xs font-semibold text-muted">Fraud flagged</p>
          <p className="mt-2 font-display text-2xl font-semibold">
            {dashQ.isLoading ? '—' : String(dashQ.data?.fraudFlaggedTransactions ?? 0)}
          </p>
        </div>
        <div className="surface p-5">
          <p className="text-xs font-semibold text-muted">Dormant accounts</p>
          <p className="mt-2 font-display text-2xl font-semibold">
            {dashQ.isLoading ? '—' : String(dashQ.data?.dormantAccounts ?? 0)}
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="surface p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">Daily volume</h2>
              <p className="text-sm text-muted">By transaction type</p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            {dailyQ.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Spinner /> Loading...
              </div>
            ) : (
              <pre className="max-h-72 overflow-auto rounded-lg bg-black/5 p-4 text-xs">
                {JSON.stringify(dailyQ.data ?? {}, null, 2)}
              </pre>
            )}
          </div>
        </div>

        <div className="surface p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Revenue</h2>
              <p className="text-sm text-muted">Charges and fees</p>
            </div>
            <Badge tone="neutral">API</Badge>
          </div>

          <div className="mt-4">
            {revenueQ.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Spinner /> Loading...
              </div>
            ) : (
              <pre className="max-h-72 overflow-auto rounded-lg bg-black/5 p-4 text-xs">
                {JSON.stringify(revenueQ.data ?? {}, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </section>

      <section className="surface p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">High-value transactions</h2>
            <p className="text-sm text-muted">Threshold based list</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="number"
              min={0}
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="threshold"
            />
            <Input
              type="number"
              min={1}
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="limit"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => highValueQ.refetch()}
            >
              Refresh
            </Button>
          </div>
        </div>

        <div className="mt-4">
          {highValueQ.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Spinner /> Loading...
            </div>
          ) : highValueQ.data?.length ? (
            <div className="grid gap-3">
              {highValueQ.data.map((t) => (
                <div
                  key={t.referenceNumber}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-black/5 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {t.transactionType} • {t.referenceNumber}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {t.sourceAccountNumber}
                      {t.destinationAccountNumber ? ` → ${t.destinationAccountNumber}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(t.amount)}</p>
                    <p className="mt-1 text-xs text-muted">{t.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No transactions found.</p>
          )}
        </div>
      </section>

      <section className="surface p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Branch performance</h2>
            <p className="text-sm text-muted">Branch-wise summary</p>
          </div>
          <Badge tone="neutral">API</Badge>
        </div>
        <div className="mt-4">
          {branchPerfQ.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Spinner /> Loading...
            </div>
          ) : branchPerfQ.data?.length ? (
            <div className="grid gap-3">
              {branchPerfQ.data.map((b) => (
                <div
                  key={b.branchId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-black/5 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold">{b.branchCode}</p>
                    <p className="mt-1 text-xs text-muted">
                      {b.customers} customers • {b.accounts} accounts
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{b.transferVolume}</p>
                    <p className="mt-1 text-xs text-muted">transfer volume</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No data found.</p>
          )}
        </div>
      </section>
    </div>
  )
}

