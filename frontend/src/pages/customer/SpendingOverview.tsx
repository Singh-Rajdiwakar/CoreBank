import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { getSpendingOverview } from '../../api/reporting'
import { Spinner } from '../../components/ui/Spinner'
import { useCustomerAccounts } from '../../lib/hooks'

export default function SpendingOverviewPage() {
  const accounts = useCustomerAccounts()
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const overviewQ = useQuery({
    queryKey: ['spending-overview', selectedAccount, { fromDate, toDate }],
    queryFn: () =>
      getSpendingOverview(selectedAccount, {
        from: fromDate || undefined,
        to: toDate || undefined,
      }),
    enabled: !!selectedAccount,
  })

  const data = overviewQ.data

  return (
    <div className="space-y-5">
      <header>
        <p className="chip">Customer</p>
        <h1 className="mt-3 font-display text-2xl font-semibold">Spending Overview</h1>
        <p className="mt-1 text-sm text-muted">Analyze your spending by category</p>
      </header>

      <div className="surface p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="spending-account" className="block text-xs font-semibold mb-2">Select Account</label>
            <select
              id="spending-account"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="input w-full"
              aria-label="Select Account"
            >
              <option value="">Choose an account...</option>
              {accounts.map((a) => (
                <option key={a.accountNumber} value={a.accountNumber}>
                  {a.accountNumber}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="from-date-spending" className="block text-xs font-semibold mb-2">From Date</label>
            <input
              id="from-date-spending"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input w-full"
            />
          </div>
          <div>
            <label htmlFor="to-date-spending" className="block text-xs font-semibold mb-2">To Date</label>
            <input
              id="to-date-spending"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input w-full"
            />
          </div>
        </div>
      </div>

      {overviewQ.isLoading ? (
        <div className="surface p-6 flex items-center gap-2 text-sm text-muted">
          <Spinner /> Loading...
        </div>
      ) : data ? (
        <div className="grid gap-5 md:grid-cols-2">
          <div className="surface p-6 space-y-4">
            <h2 className="font-semibold">Summary</h2>
            <div className=" grid gap-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-black/5">
                <span className="text-sm text-muted">Total Debit</span>
                <span className="font-semibold">{data.totalDebit}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-black/5">
                <span className="text-sm text-muted">Total Credit</span>
                <span className="font-semibold">{data.totalCredit}</span>
              </div>
            </div>
          </div>

          {data.byCategory && Object.keys(data.byCategory).length > 0 && (
            <div className="surface p-6 space-y-4">
              <h2 className="font-semibold">By Category</h2>
              <div className="space-y-3">
                {Object.entries(data.byCategory).map(([category, amount]) => (
                  <div
                    key={category}
                    className="flex justify-between items-center p-3 rounded-lg bg-black/5"
                  >
                    <span className="text-sm capitalize">{category}</span>
                    <span className="font-semibold">{amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : selectedAccount ? (
        <div className="surface p-6 text-center text-sm text-muted">
          No spending data found
        </div>
      ) : null}
    </div>
  )
}
