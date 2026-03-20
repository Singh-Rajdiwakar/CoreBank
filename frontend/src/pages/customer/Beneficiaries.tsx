import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { listBeneficiaries, createBeneficiary, verifyBeneficiary, deleteBeneficiary } from '../../api/beneficiaries'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { errorMessage } from '../../lib/errorMessage'
import { formatDateTime } from '../../lib/format'

export default function CustomerBeneficiariesPage() {
  const [showForm, setShowForm] = useState(false)
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')
  const [bankName, setBankName] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const listQ = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: () => listBeneficiaries({ page: 0, size: 50 }),
  })

  const createM = useMutation({
    mutationFn: async () => {
      return createBeneficiary({
        accountNumber,
        accountHolderName,
        bankName,
        ifscCode,
      })
    },
    onSuccess: () => {
      toast.success('Beneficiary added. Verification pending.')
      resetForm()
      setShowForm(false)
      void listQ.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const verifyM = useMutation({
    mutationFn: (id: number) => verifyBeneficiary(id),
    onSuccess: () => {
      toast.success('Beneficiary verified')
      void listQ.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const deleteM = useMutation({
    mutationFn: (id: number) => deleteBeneficiary(id),
    onSuccess: () => {
      toast.success('Beneficiary deleted')
      void listQ.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const resetForm = () => {
    setAccountNumber('')
    setAccountHolderName('')
    setBankName('')
    setIfscCode('')
  }

  const beneficiaries = listQ.data?.content ?? []
  const isValid = accountNumber && accountHolderName && bankName && ifscCode

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Customer</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Beneficiaries</h1>
          <p className="mt-1 text-sm text-muted">Manage your beneficiary accounts for transfers.</p>
        </div>
        <Badge tone="neutral">{beneficiaries.length} beneficiaries</Badge>
      </header>

      {!showForm ? (
        <div className="surface p-6">
          <button
            type="button"
            className="rounded-lg bg-black/5 px-4 py-2 text-sm font-semibold hover:bg-black/10"
            onClick={() => setShowForm(true)}
          >
            Add Beneficiary
          </button>
        </div>
      ) : (
        <div className="surface space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Account Number *</label>
              <Input
                type="text"
                placeholder="Account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Account Holder Name *</label>
              <Input
                type="text"
                placeholder="Full name"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Bank Name *</label>
              <Input
                type="text"
                placeholder="Bank name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">IFSC Code *</label>
              <Input
                type="text"
                placeholder="IFSC code"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              disabled={!isValid || createM.isPending}
              onClick={() => createM.mutate()}
            >
              {createM.isPending ? <Spinner className="h-4 w-4" /> : 'Add Beneficiary'}
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
        {listQ.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Spinner /> Loading beneficiaries...
          </div>
        ) : beneficiaries.length ? (
          <div className="grid gap-3">
            {beneficiaries.map((b) => (
              <div key={b.id} className="flex items-start justify-between rounded-lg bg-black/5 p-4">
                <div className="flex-1">
                  <p className="font-semibold">{b.accountHolderName}</p>
                  <p className="mt-1 text-xs text-muted">
                    {b.accountNumber} • {b.bankName} • {b.ifscCode}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Badge tone={b.status === 'VERIFIED' ? 'success' : 'warning'}>{b.status}</Badge>
                    {b.status === 'PENDING_VERIFICATION' && b.coolingPeriodEndsOn && (
                      <Badge tone="neutral">Cooling: {formatDateTime(b.coolingPeriodEndsOn)}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {b.status === 'PENDING_VERIFICATION' && (
                    <button
                      type="button"
                      className="rounded-lg border border-green-600 px-2 py-1 text-xs font-semibold text-green-600 hover:bg-green-50"
                      onClick={() => verifyM.mutate(b.id)}
                      disabled={verifyM.isPending}
                    >
                      Verify
                    </button>
                  )}
                  <button
                    type="button"
                    className="rounded-lg border border-red-600 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (confirm('Delete this beneficiary?')) {
                        deleteM.mutate(b.id)
                      }
                    }}
                    disabled={deleteM.isPending}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No beneficiaries. Add one to enable transfers.</p>
        )}
      </div>
    </div>
  )
}
