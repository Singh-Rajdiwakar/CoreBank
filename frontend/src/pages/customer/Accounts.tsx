import { useQuery } from '@tanstack/react-query'

import { listMyAccounts } from '../../api/accounts'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency } from '../../lib/format'

export default function CustomerAccountsPage() {
  const accountsQ = useQuery({
    queryKey: ['accounts', { page: 0, size: 50 }],
    queryFn: () => listMyAccounts({ page: 0, size: 50 }),
  })

  const accounts = accountsQ.data?.content ?? []

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Customer</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Accounts</h1>
          <p className="mt-1 text-sm text-muted">Fetched from `/api/accounts`.</p>
        </div>
        <Badge tone="neutral">Page {accountsQ.data?.page ?? 0}</Badge>
      </header>

      <div className="surface p-6">
        {accountsQ.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Spinner /> Loading accounts...
          </div>
        ) : accounts.length ? (
          <div className="grid gap-3">
            {accounts.map((a) => (
              <div
                key={a.accountNumber}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-black/5 p-4"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {a.accountType} • {a.accountNumber}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Status: <span className="font-semibold">{a.status}</span> • Currency:{' '}
                    <span className="font-semibold">{a.currency}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatCurrency(a.availableBalance, a.currency)}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Balance: {formatCurrency(a.balance, a.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No accounts found.</p>
        )}
      </div>
    </div>
  )
}

