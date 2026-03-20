import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { listMyAccounts } from '../../api/accounts'
import { listMyRds, createRd, payRdInstallment } from '../../api/deposit-products'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { errorMessage } from '../../lib/errorMessage'
import { formatCurrency, formatDateTime } from '../../lib/format'

export default function CustomerRDPage() {
  const [showForm, setShowForm] = useState(false)
  const [accountNumber, setAccountNumber] = useState('')
  const [installmentAmount, setInstallmentAmount] = useState('')
  const [tenure, setTenure] = useState('12')
  const [selectedRdId, setSelectedRdId] = useState<number | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')

  const rdsQ = useQuery({
    queryKey: ['deposit-products', 'rd', 'my'],
    queryFn: () => listMyRds({ page: 0, size: 50 }),
  })

  const accountsQ = useQuery({
    queryKey: ['accounts', { page: 0, size: 50 }],
    queryFn: () => listMyAccounts({ page: 0, size: 50 }),
  })

  const createM = useMutation({
    mutationFn: async () => {
      return createRd({
        accountNumber,
        installmentAmount: parseFloat(installmentAmount),
        tenure: parseInt(tenure),
      })
    },
    onSuccess: () => {
      toast.success('Recurring Deposit created successfully')
      resetForm()
      setShowForm(false)
      void rdsQ.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const payM = useMutation({
    mutationFn: async () => {
      if (!selectedRdId) return
      return payRdInstallment(selectedRdId, parseFloat(paymentAmount))
    },
    onSuccess: () => {
      toast.success('RD installment paid')
      setPaymentAmount('')
      setSelectedRdId(null)
      void rdsQ.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const resetForm = () => {
    setAccountNumber('')
    setInstallmentAmount('')
    setTenure('12')
  }

  const rds = rdsQ.data?.content ?? []
  const accounts = accountsQ.data?.content ?? []
  const isValid = accountNumber && installmentAmount && tenure

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Customer</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Recurring Deposits (RD)</h1>
          <p className="mt-1 text-sm text-muted">Create and manage your recurring deposit accounts.</p>
        </div>
        <Badge tone="neutral">{rds.length} RDs</Badge>
      </header>

      {!showForm ? (
        <div className="surface p-6">
          <button
            type="button"
            className="rounded-lg bg-black/5 px-4 py-2 text-sm font-semibold hover:bg-black/10"
            onClick={() => setShowForm(true)}
          >
            Create RD
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
              <label className="text-sm font-semibold">Monthly Installment *</label>
              <Input
                type="number"
                placeholder="Amount"
                value={installmentAmount}
                onChange={(e) => setInstallmentAmount(e.target.value)}
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
              {createM.isPending ? <Spinner className="h-4 w-4" /> : 'Create RD'}
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
        {rdsQ.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Spinner /> Loading RDs...
          </div>
        ) : rds.length ? (
          <div className="grid gap-4">
            {rds.map((rd) => (
              <div key={rd.id} className="rounded-lg border border-black/10 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{rd.rdNumber}</p>
                    <p className="mt-1 text-xs text-muted">{rd.accountNumber}</p>
                  </div>
                  <Badge tone={rd.status === 'ACTIVE' ? 'success' : rd.status === 'MATURED' ? 'warning' : 'neutral'}>
                    {rd.status}
                  </Badge>
                </div>

                <div className="mt-3 grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Monthly Installment</span>
                    <span className="font-semibold">{formatCurrency(rd.installmentAmount, 'INR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Rate</span>
                    <span className="font-semibold">{rd.rateOfInterest}% p.a.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Maturity Date</span>
                    <span className="font-semibold">{formatDateTime(rd.maturityDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Total Amount</span>
                    <span className="font-semibold text-green-600">{formatCurrency(rd.totalAmount, 'INR')}</span>
                  </div>
                  {rd.nextInstallmentDate && (
                    <div className="flex justify-between">
                      <span className="text-muted">Next Installment</span>
                      <span className="font-semibold">{formatDateTime(rd.nextInstallmentDate)}</span>
                    </div>
                  )}
                </div>

                {rd.status === 'ACTIVE' && selectedRdId !== rd.id && (
                  <button
                    type="button"
                    className="mt-4 w-full rounded border border-blue-600 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                    onClick={() => setSelectedRdId(rd.id)}
                  >
                    Pay Installment
                  </button>
                )}

                {rd.status === 'ACTIVE' && selectedRdId === rd.id && (
                  <div className="mt-4 space-y-2 border-t border-black/10 pt-4">
                    <Input
                      type="number"
                      placeholder={`Installment: ${rd.installmentAmount}`}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="flex-1 rounded border border-blue-600 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                        onClick={() => payM.mutate()}
                        disabled={!paymentAmount || payM.isPending}
                      >
                        Confirm Payment
                      </button>
                      <button
                        type="button"
                        className="flex-1 rounded border border-black/10 px-3 py-2 text-sm font-semibold hover:bg-black/5"
                        onClick={() => {
                          setSelectedRdId(null)
                          setPaymentAmount('')
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No RDs. Create one to save regularly.</p>
        )}
      </div>
    </div>
  )
}
