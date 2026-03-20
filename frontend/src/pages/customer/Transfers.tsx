import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'

import { listMyAccounts } from '../../api/accounts'
import { listBeneficiaries } from '../../api/beneficiaries'
import type { SelfTransferRequest, InternalTransferRequest, BeneficiaryTransferRequest, ExternalTransferRequest } from '../../api/transfers'
import { recentTransfers, selfTransfer, internalTransfer, beneficiaryTransfer, externalTransfer } from '../../api/transfers'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { errorMessage } from '../../lib/errorMessage'
import { formatCurrency, formatDateTime } from '../../lib/format'

type TransferType = 'SELF' | 'INTERNAL' | 'BENEFICIARY' | 'EXTERNAL'
type ExternalMode = 'NEFT' | 'IMPS' | 'RTGS' | 'UPI'

export default function CustomerTransfersPage() {
  const [transferType, setTransferType] = useState<TransferType>('SELF')
  const [externalMode, setExternalMode] = useState<ExternalMode>('NEFT')
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [sourceAccount, setSourceAccount] = useState('')
  const [destAccount, setDestAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [remarks, setRemarks] = useState('')
  const [transactionPin, setTransactionPin] = useState('')
  const [beneficiaryId, setBeneficiaryId] = useState<number | null>(null)
  const [beneficiaryName, setBeneficiaryName] = useState('')

  const accountsQ = useQuery({
    queryKey: ['accounts', { page: 0, size: 50 }],
    queryFn: () => listMyAccounts({ page: 0, size: 50 }),
  })

  const beneficiariesQ = useQuery({
    queryKey: ['beneficiaries', { page: 0, size: 50 }],
    queryFn: () => listBeneficiaries({ page: 0, size: 50 }),
  })

  const recentQ = useQuery({
    queryKey: ['transfers', 'recent'],
    queryFn: recentTransfers,
  })

  const transferM = useMutation({
    mutationFn: async () => {
      const idempotencyKey = uuidv4()
      const commonData = {
        amount: parseFloat(amount),
        remarks,
        transactionPin,
      }

      if (transferType === 'SELF') {
        const req: SelfTransferRequest = {
          ...commonData,
          sourceAccountNumber: sourceAccount,
          destinationAccountNumber: destAccount,
          transferMode: 'SELF',
        }
        return selfTransfer(req, idempotencyKey)
      } else if (transferType === 'INTERNAL') {
        const req: InternalTransferRequest = {
          ...commonData,
          sourceAccountNumber: sourceAccount,
          destinationAccountNumber: destAccount,
          transferMode: 'INTERNAL',
        }
        return internalTransfer(req, idempotencyKey)
      } else if (transferType === 'BENEFICIARY') {
        const req: BeneficiaryTransferRequest = {
          ...commonData,
          sourceAccountNumber: sourceAccount,
          beneficiaryId: beneficiaryId!,
          transferMode: 'BENEFICIARY',
        }
        return beneficiaryTransfer(req, idempotencyKey)
      } else {
        const req: ExternalTransferRequest = {
          ...commonData,
          sourceAccountNumber: sourceAccount,
          destinationAccountNumber: destAccount,
          transferMode: externalMode,
          beneficiaryName,
        }
        return externalTransfer(req, idempotencyKey)
      }
    },
    onSuccess: (data) => {
      toast.success(`Transfer initiated: ${data.referenceNumber}`)
      resetForm()
      setShowForm(false)
      void recentQ.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const resetForm = () => {
    setSourceAccount('')
    setDestAccount('')
    setAmount('')
    setRemarks('')
    setTransactionPin('')
    setBeneficiaryId(null)
    setBeneficiaryName('')
  }

  const accounts = accountsQ.data?.content ?? []
  const beneficiaries = beneficiariesQ.data?.content ?? []
  const recent = recentQ.data ?? []

  const isValid = sourceAccount && amount && transactionPin &&
    (transferType === 'SELF' || transferType === 'INTERNAL' || transferType === 'EXTERNAL' ? destAccount : beneficiaryId)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Customer</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Transfers</h1>
          <p className="mt-1 text-sm text-muted">Self, internal, beneficiary, or external transfers.</p>
        </div>
        <Badge tone="success">Ready to use</Badge>
      </header>

      {!showForm ? (
        <div className="surface p-6">
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            onClick={() => setShowForm(true)}
          >
            New Transfer
          </button>
        </div>
      ) : (
        <div className="surface space-y-6 p-6">
          <div className="flex gap-2">
            {(['SELF', 'INTERNAL', 'BENEFICIARY', 'EXTERNAL'] as const).map((type) => (
              <button
                key={type}
                type="button"
                className={`rounded px-3 py-1 text-sm font-semibold transition ${
                  transferType === type ? 'bg-blue-600 text-white' : 'bg-black/5 hover:bg-black/10'
                }`}
                onClick={() => {
                  setTransferType(type)
                  resetForm()
                }}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">From Account *</label>
              <select
                className="mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                value={sourceAccount}
                onChange={(e) => setSourceAccount(e.target.value)}
              >
                <option value="">Select account</option>
                {accounts.map((a) => (
                  <option key={a.accountNumber} value={a.accountNumber}>
                    {a.accountNumber} ({a.accountType})
                  </option>
                ))}
              </select>
            </div>

            {transferType === 'BENEFICIARY' ? (
              <div>
                <label className="text-sm font-semibold">Beneficiary *</label>
                <select
                  className="mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                  value={beneficiaryId ?? ''}
                  onChange={(e) => {
                    const id = parseInt(e.target.value)
                    setBeneficiaryId(id)
                    const ben = beneficiaries.find((b) => b.id === id)
                    if (ben && !ben.canTransferNow) {
                      toast.error(`Beneficiary cooling period active until ${ben.coolingPeriodEndsOn}`)
                    }
                  }}
                >
                  <option value="">Select beneficiary</option>
                  {beneficiaries.map((b) => (
                    <option key={b.id} value={b.id} disabled={!b.canTransferNow}>
                      {b.accountHolderName} - {b.accountNumber} {!b.canTransferNow ? '(Cooling period)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-sm font-semibold">
                  {transferType === 'EXTERNAL' ? 'Destination Account' : 'To Account'} *
                </label>
                <Input
                  type="text"
                  placeholder="Destination account number"
                  value={destAccount}
                  onChange={(e) => setDestAccount(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="text-sm font-semibold">Amount *</label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {transferType === 'EXTERNAL' && (
              <div>
                <label className="text-sm font-semibold">Mode *</label>
                <select
                  className="mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
                  value={externalMode}
                  onChange={(e) => setExternalMode(e.target.value as ExternalMode)}
                >
                  <option value="NEFT">NEFT</option>
                  <option value="IMPS">IMPS</option>
                  <option value="RTGS">RTGS</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
            )}

            {transferType === 'EXTERNAL' && (
              <div>
                <label className="text-sm font-semibold">Beneficiary Name *</label>
                <Input
                  type="text"
                  placeholder="Name of beneficiary"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                />
              </div>
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

            <div className="md:col-span-2">
              <label className="text-sm font-semibold">Transaction PIN *</label>
              <Input
                type="password"
                placeholder="Enter your transaction PIN"
                value={transactionPin}
                onChange={(e) => setTransactionPin(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              disabled={!isValid || transferM.isPending}
              onClick={() => transferM.mutate()}
            >
              {transferM.isPending ? <Spinner className="h-4 w-4" /> : 'Initiate Transfer'}
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
        <h3 className="mb-4 font-semibold">Recent Transfers</h3>
        {recentQ.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Spinner /> Loading...
          </div>
        ) : recent.length ? (
          <div className="space-y-2">
            {recent.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg bg-black/5 p-3 text-sm">
                <div>
                  <p className="font-semibold">{t.referenceNumber}</p>
                  <p className="text-xs text-muted">{formatDateTime(t.initiatedAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(t.amount, 'INR')}</p>
                  <p className={`text-xs ${
                    t.status === 'SUCCESS' ? 'text-green-600' :
                    t.status === 'PENDING' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {t.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No recent transfers.</p>
        )}
      </div>
    </div>
  )
}


