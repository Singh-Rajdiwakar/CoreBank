import { useQuery } from '@tanstack/react-query'
import { Activity, ArrowUpRight, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'

import { listMyAccounts } from '../../api/accounts'
import { unreadCount } from '../../api/notifications'
import { recentTransfers } from '../../api/transfers'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency, formatDateTime } from '../../lib/format'

export default function CustomerDashboardPage() {
  const accountsQ = useQuery({
    queryKey: ['accounts', { page: 0, size: 20 }],
    queryFn: () => listMyAccounts({ page: 0, size: 20 }),
  })

  const transfersQ = useQuery({
    queryKey: ['transfers', 'recent'],
    queryFn: recentTransfers,
  })

  const unreadQ = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: unreadCount,
  })

  const accounts = accountsQ.data?.content ?? []
  const totalAvail = accounts.reduce((sum, a) => sum + (a.availableBalance ?? 0), 0)
  const unread = unreadQ.data?.IN_APP ?? 0

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Customer portal</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Accounts, transfers and alerts from backend APIs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/app/transfers">
            <Button>
              New transfer <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
          <a
            className="inline-flex items-center gap-2 rounded-lg bg-black/5 px-4 py-3 text-sm font-semibold text-ink hover:bg-black/10"
            href="http://localhost:8080/swagger-ui/index.html"
            target="_blank"
            rel="noreferrer"
          >
            Swagger
          </a>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="surface p-5">
          <p className="text-xs font-semibold text-muted">Available</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-black/5">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold">
                {formatCurrency(totalAvail, accounts[0]?.currency ?? 'INR')}
              </p>
              <p className="text-xs text-muted">{accounts.length} accounts</p>
            </div>
          </div>
        </div>

        <div className="surface p-5">
          <p className="text-xs font-semibold text-muted">Recent transfers</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-black/5">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold">
                {transfersQ.isLoading ? '—' : String(transfersQ.data?.length ?? 0)}
              </p>
              <p className="text-xs text-muted">last activity</p>
            </div>
          </div>
        </div>

        <div className="surface p-5">
          <p className="text-xs font-semibold text-muted">Unread notifications</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-black/5">
              <span className="text-sm font-bold">{unread}</span>
            </div>
            <div>
              <p className="font-display text-xl font-semibold">{unread}</p>
              <p className="text-xs text-muted">in-app</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Accounts</h2>
            <Link to="/app/accounts" className="text-sm font-semibold text-primary">
              View all
            </Link>
          </div>
          <div className="mt-4">
            {accountsQ.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Spinner /> Loading accounts...
              </div>
            ) : accounts.length ? (
              <div className="grid gap-3">
                {accounts.slice(0, 4).map((a) => (
                  <div
                    key={a.accountNumber}
                    className="flex items-center justify-between rounded-xl bg-black/5 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {a.accountType} • {a.accountNumber}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Status: <span className="font-semibold">{a.status}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(a.availableBalance, a.currency)}
                      </p>
                      <p className="mt-1 text-xs text-muted">available</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No accounts found.</p>
            )}
          </div>
        </div>

        <div className="surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent transfers</h2>
            <Badge tone="neutral">API</Badge>
          </div>
          <div className="mt-4">
            {transfersQ.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Spinner /> Loading transfers...
              </div>
            ) : transfersQ.data?.length ? (
              <div className="grid gap-3">
                {transfersQ.data.slice(0, 5).map((t) => (
                  <div
                    key={t.referenceNumber}
                    className="flex items-center justify-between rounded-xl bg-black/5 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">{t.transactionType}</p>
                      <p className="mt-1 text-xs text-muted">
                        {t.sourceAccountNumber}
                        {t.destinationAccountNumber ? ` → ${t.destinationAccountNumber}` : ''}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {formatDateTime(t.initiatedAt)}
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
              <p className="text-sm text-muted">No recent transfers.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

