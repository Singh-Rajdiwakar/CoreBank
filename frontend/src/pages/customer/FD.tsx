import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { listMyAccounts } from '../../api/accounts'
import { listMyFds, createFd, withdrawFdPrematurely } from '../../api/deposit-products'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { errorMessage } from '../../lib/errorMessage'
import { formatCurrency, formatDateTime } from '../../lib/format'

export default function CustomerFDPage() {
  const [showForm, setShowForm] = useState(false)
  const [accountNumber, setAccountNumber] = useState('')
  const [principal, setPrincipal] = useState('')
  const [tenure, setTenure] = useState('12')

  const fdsQ = useQuery({
    queryKey: ['deposit-products', 'fd', 'my'],
    queryFn: () => listMyFds({ page: 0, size: 50 }),
  })

  const accountsQ = useQuery({
    queryKey: ['accounts', { page: 0, size: 50 }],
    queryFn: () => listMyAccounts({ page: 0, size: 50 }),
  })

  const createM = useMutation({
    mutationFn: async () => {
      return createFd({
        accountNumber,
        principal: parseFloat(principal),
        tenure: parseInt(tenure),
      })
    },
    onSuccess: () => {
      toast.success('Fixed Deposit created successfully')
      resetForm()
      setShowForm(false)
      void fdsQ.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const withdrawM = useMutation({
    mutationFn: (id: number) => withdrawFdPrematurely(id),
    onSuccess: () => {
      toast.success('FD withdrawal initiated')
      void fdsQ.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const resetForm = () => {
    setAccountNumber('')
    setPrincipal('')
    setTenure('12')
  }

  const fds = fdsQ.data?.content ?? []
  const accounts = accountsQ.data?.content ?? []
  const isValid = accountNumber && principal && tenure

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Customer</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Fixed Deposits (FD)</h1>
          <p className="mt-1 text-sm text-muted">Create and manage your fixed deposit accounts.</p>
        </div>
        <Badge tone="neutral">{fds.length} FDs</Badge>
      </header>

      {!showForm ? (
        <div className="surface p-6">
          <button
            type="button"
            className="rounded-lg bg-black/5 px-4 py-2 text-sm font-semibold hover:bg-black/10"
            onClick={() => setShowForm(true)}
          >
            Create FD
          </button>
        </div>
      ) : (
        <div className="surface space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Account *</label>
              <select
                className="mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              >
                <option value="">Select account</option>
                {accounts.map((a) => (
                  <option key={a.accountNumber} value={a.accountNumber}>
                    {a.accountNumber} - {formatCurrency(a.balance, a.currency)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">Principal Amount *</label>
              <Input
                type="number"
                placeholder="Amount"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Tenure (Months) *</label>
              <Input
                type="number"
                placeholder="12"
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              disabled={!isValid || createM.isPending}
              onClick={() => createM.mutate()}
            >
              {createM.isPending ? <Spinner className="h-4 w-4" /> : 'Create FD'}
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
        {fdsQ.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Spinner /> Loading FDs...
          </div>
        ) : fds.length ? (
          <div className="grid gap-4">
            {fds.map((fd) => (
              <div key={fd.id} className="rounded-lg border border-black/10 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{fd.fdNumber}</p>
                    <p className="mt-1 text-xs text-muted">{fd.accountNumber}</p>
                  </div>
                  <Badge tone={fd.status === 'ACTIVE' ? 'success' : fd.status === 'MATURED' ? 'warning' : 'neutral'}>
                    {fd.status}
                  </Badge>
                </div>

                <div className="mt-3 grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Principal</span>
                    <span className="font-semibold">{formatCurrency(fd.principal, 'INR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Rate</span>
                    <span className="font-semibold">{fd.rateOfInterest}% p.a.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Maturity Date</span>
                    <span className="font-semibold">{formatDateTime(fd.maturityDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Maturity Amount</span>
                    <span className="font-semibold text-green-600">{formatCurrency(fd.maturityAmount, 'INR')}</span>
                  </div>
                </div>

                {fd.status === 'ACTIVE' && (
                  <button
                    type="button"
                    className="mt-4 w-full rounded border border-orange-600 px-3 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50"
                    onClick={() => {
                      if (confirm('Withdraw FD prematurely? (Penalty will apply)')) {
                        withdrawM.mutate(fd.id)
                      }
                    }}
                    disabled={withdrawM.isPending}
                  >
                    Withdraw Prematurely
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No FDs. Create one to earn fixed returns.</p>
        )}
      </div>
    </div>
  )
}
