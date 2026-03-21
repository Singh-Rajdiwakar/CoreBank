import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { listMyAccounts } from '../../api/accounts'
import { listMyLoans, applyLoan, payEmi } from '../../api/loans'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { errorMessage } from '../../lib/errorMessage'
import { formatCurrency, formatDateTime } from '../../lib/format'

type LoanType = 'PERSONAL' | 'HOME' | 'EDUCATION' | 'AUTO' | 'BUSINESS'

export default function CustomerLoansPage() {
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [loanType, setLoanType] = useState<LoanType>('PERSONAL')
  const [accountNumber, setAccountNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [tenure, setTenure] = useState('12')
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null)
  const [emiAmount, setEmiAmount] = useState('')
  const [transactionPin, setTransactionPin] = useState('')

  const loansQ = useQuery({
    queryKey: ['loans', 'my'],
    queryFn: () => listMyLoans({ page: 0, size: 50 }),
  })

  const accountsQ = useQuery({
    queryKey: ['accounts', { page: 0, size: 50 }],
    queryFn: () => listMyAccounts({ page: 0, size: 50 }),
  })

  const applyM = useMutation({
    mutationFn: async () => {
      return applyLoan({
        accountNumber,
        loanType,
        amount: parseFloat(amount),
        tenure: parseInt(tenure),
      })
    },
    onSuccess: () => {
      toast.success('Loan application submitted')
      resetApplyForm()
      setShowApplyForm(false)
      void loansQ.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const payEmiM = useMutation({
    mutationFn: async () => {
      if (!selectedLoanId) return
      return payEmi(selectedLoanId, parseFloat(emiAmount))
    },
    onSuccess: () => {
      toast.success('EMI payment successful')
      setEmiAmount('')
      setTransactionPin('')
      setSelectedLoanId(null)
      void loansQ.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const resetApplyForm = () => {
    setAccountNumber('')
    setAmount('')
    setTenure('12')
  }

  const loans = loansQ.data?.content ?? []
  const accounts = accountsQ.data?.content ?? []
  const applyIsValid = accountNumber && amount && tenure

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Customer</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Loans</h1>
          <p className="mt-1 text-sm text-muted">Apply for loans and manage EMI payments.</p>
        </div>
        <Badge tone="neutral">{loans.length} loans</Badge>
      </header>

      {!showApplyForm ? (
        <div className="surface p-6">
          <button
            type="button"
            className="rounded-lg bg-black/5 px-4 py-2 text-sm font-semibold hover:bg-black/10"
            onClick={() => setShowApplyForm(true)}
          >
            Apply for Loan
          </button>
        </div>
      ) : (
        <div className="surface space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Loan Type *</label>
              <select
                className="mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                value={loanType}
                onChange={(e) => setLoanType(e.target.value as LoanType)}
              >
                <option value="PERSONAL">Personal Loan</option>
                <option value="HOME">Home Loan</option>
                <option value="EDUCATION">Education Loan</option>
                <option value="AUTO">Auto Loan</option>
                <option value="BUSINESS">Business Loan</option>
              </select>
            </div>

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
                    {a.accountNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">Loan Amount *</label>
              <Input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
              disabled={!applyIsValid || applyM.isPending}
              onClick={() => applyM.mutate()}
            >
              {applyM.isPending ? <Spinner className="h-4 w-4" /> : 'Apply Loan'}
            </Button>
            <button
              type="button"
              className="rounded-lg border border-black/10 px-4 py-2 text-sm font-semibold hover:bg-black/5"
              onClick={() => {
                setShowApplyForm(false)
                resetApplyForm()
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="surface p-6">
        {loansQ.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Spinner /> Loading loans...
          </div>
        ) : loans.length ? (
          <div className="grid gap-4">
            {loans.map((loan) => (
              <div key={loan.id} className="rounded-lg border border-black/10 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{loan.loanType} Loan</p>
                    <p className="mt-1 text-xs text-muted">{loan.loanId}</p>
                  </div>
                  <Badge tone={loan.status === 'ACTIVE' ? 'success' : loan.status === 'REJECTED' ? 'danger' : 'warning'}>
                    {loan.status}
                  </Badge>
                </div>

                <div className="mt-3 grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Principal</span>
                    <span className="font-semibold">{formatCurrency(loan.principal, 'INR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Rate of Interest</span>
                    <span className="font-semibold">{loan.rateOfInterest}% p.a.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">EMI</span>
                    <span className="font-semibold">{formatCurrency(loan.emi, 'INR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Outstanding</span>
                    <span className="font-semibold">{formatCurrency(loan.outstanding, 'INR')}</span>
                  </div>
                  {loan.nextEmiDate && (
                    <div className="flex justify-between">
                      <span className="text-muted">Next EMI</span>
                      <span className="font-semibold">{formatDateTime(loan.nextEmiDate)}</span>
                    </div>
                  )}
                </div>

                {loan.status === 'ACTIVE' && selectedLoanId !== loan.id && (
                  <button
                    type="button"
                    className="mt-4 w-full rounded border border-green-600 px-3 py-2 text-sm font-semibold text-green-600 hover:bg-green-50"
                    onClick={() => setSelectedLoanId(loan.id)}
                  >
                    Pay EMI
                  </button>
                )}

                {loan.status === 'ACTIVE' && selectedLoanId === loan.id && (
                  <div className="mt-4 space-y-2 border-t border-black/10 pt-4">
                    <Input
                      type="number"
                      placeholder={`EMI Amount: ${loan.emi}`}
                      value={emiAmount}
                      onChange={(e) => setEmiAmount(e.target.value)}
                    />
                    <Input
                      type="password"
                      placeholder="Transaction PIN"
                      value={transactionPin}
                      onChange={(e) => setTransactionPin(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="flex-1 rounded border border-green-600 px-3 py-2 text-sm font-semibold text-green-600 hover:bg-green-50"
                        onClick={() => payEmiM.mutate()}
                        disabled={!emiAmount || !transactionPin || payEmiM.isPending}
                      >
                        Confirm Payment
                      </button>
                      <button
                        type="button"
                        className="flex-1 rounded border border-black/10 px-3 py-2 text-sm font-semibold hover:bg-black/5"
                        onClick={() => {
                          setSelectedLoanId(null)
                          setEmiAmount('')
                          setTransactionPin('')
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
          <p className="text-sm text-muted">No loans. Apply for one to get started.</p>
        )}
      </div>
    </div>
  )
}
