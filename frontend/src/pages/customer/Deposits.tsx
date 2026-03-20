import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { listMyAccounts } from '../../api/accounts'
import { createDeposit } from '../../api/deposits'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { errorMessage } from '../../lib/errorMessage'
import { formatCurrency } from '../../lib/format'

export default function CustomerDepositsPage() {
  const [showForm, setShowForm] = useState(false)
  const [mode, setMode] = useState<'CASH' | 'CHEQUE' | 'TRANSFER'>('CASH')
  const [accountNumber, setAccountNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [remarks, setRemarks] = useState('')
  const [chequeNumber, setChequeNumber] = useState('')
  const [chequeDate, setChequeDate] = useState('')

  const accountsQ = useQuery({
    queryKey: ['accounts', { page: 0, size: 50 }],
    queryFn: () => listMyAccounts({ page: 0, size: 50 }),
  })

  const depositM = useMutation({
    mutationFn: async () => {
      const req: any = {
        accountNumber,
        amount: parseFloat(amount),
        mode,
        remarks,
      }
      if (mode === 'CHEQUE') {
        req.chequeNumber = chequeNumber
        req.chequeDate = chequeDate
      }
      return createDeposit(req)
    },
    onSuccess: (data) => {
      toast.success(`Deposit initiated: ${data.reference}`)
      resetForm()
      setShowForm(false)
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const resetForm = () => {
    setAccountNumber('')
    setAmount('')
    setRemarks('')
    setChequeNumber('')
    setChequeDate('')
  }

  const accounts = accountsQ.data?.content ?? []
  const isValid = accountNumber && amount && parseFloat(amount) > 0 &&
    (mode !== 'CHEQUE' || (chequeNumber && chequeDate))

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Customer</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Deposits</h1>
          <p className="mt-1 text-sm text-muted">Deposit cash, cheques, or transfers to your account.</p>
        </div>
        <Badge tone="success">Ready to use</Badge>
      </header>

      {!showForm ? (
        <div className="surface p-6">
          <button
            type="button"
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            onClick={() => setShowForm(true)}
          >
            New Deposit
          </button>
        </div>
      ) : (
        <div className="surface space-y-6 p-6">
          <div className="flex gap-2">
            {(['CASH', 'CHEQUE', 'TRANSFER'] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={`rounded px-3 py-1 text-sm font-semibold transition ${
                  mode === m ? 'bg-green-600 text-white' : 'bg-black/5 hover:bg-black/10'
                }`}
                onClick={() => {
                  setMode(m)
                  resetForm()
                }}
              >
                {m}
              </button>
            ))}
          </div>

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
                    {a.accountNumber} ({a.accountType}) - {formatCurrency(a.balance, a.currency)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">Amount *</label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {mode === 'CHEQUE' && (
              <>
                <div>
                  <label className="text-sm font-semibold">Cheque Number *</label>
                  <Input
                    type="text"
                    placeholder="Cheque number"
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Cheque Date *</label>
                  <Input
                    type="date"
                    value={chequeDate}
                    onChange={(e) => setChequeDate(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <label className="text-sm font-semibold">Remarks</label>
              <Input
                type="text"
                placeholder="Add remarks (optional)"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              disabled={!isValid || depositM.isPending}
              onClick={() => depositM.mutate()}
            >
              {depositM.isPending ? <Spinner className="h-4 w-4" /> : 'Confirm Deposit'}
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
    </div>
  )
}
