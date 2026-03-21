import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import {
  createFeeConfig,
  createInterestConfig,
  getFeeConfigs,
  getInterestConfigs,
} from '../../api/admin-config'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'

export default function AdminConfigPage() {
  const [activeTab, setActiveTab] = useState<'interests' | 'fees'>('interests')
  const [showForm, setShowForm] = useState(false)

  // Interests
  const [interestForm, setInterestForm] = useState({
    productType: '',
    annualRate: '',
    active: true,
  })

  // Fees
  const [feeForm, setFeeForm] = useState({
    code: '',
    description: '',
    amount: '',
    percentage: '',
    active: true,
  })

  const interestsQ = useQuery({
    queryKey: ['interests'],
    queryFn: getInterestConfigs,
  })

  const feesQ = useQuery({
    queryKey: ['fees'],
    queryFn: getFeeConfigs,
  })

  const createInterestMut = useMutation({
    mutationFn: () =>
      createInterestConfig({
        productType: interestForm.productType,
        annualRate: parseFloat(interestForm.annualRate),
        active: interestForm.active,
      }),
    onSuccess: () => {
      toast.success('Interest rate created')
      interestsQ.refetch()
      setInterestForm({ productType: '', annualRate: '', active: true })
      setShowForm(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create interest rate')
    },
  })

  const createFeeMut = useMutation({
    mutationFn: () =>
      createFeeConfig({
        code: feeForm.code,
        description: feeForm.description,
        amount: parseFloat(feeForm.amount) || 0,
        percentage: parseFloat(feeForm.percentage) || 0,
        active: feeForm.active,
      }),
    onSuccess: () => {
      toast.success('Fee configuration created')
      feesQ.refetch()
      setFeeForm({ code: '', description: '', amount: '', percentage: '', active: true })
      setShowForm(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create fee')
    },
  })

  const interests = interestsQ.data ?? []
  const fees = feesQ.data ?? []

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Admin</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Configuration</h1>
          <p className="mt-1 text-sm text-muted">Manage interest rates and fee structures</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="primary">
          {showForm ? 'Cancel' : '+ Add Config'}
        </Button>
      </header>

      <div className="surface p-6">
        <div className="flex gap-2 border-b mb-6">
          <button
            onClick={() => setActiveTab('interests')}
            className={`py-2 px-4 font-semibold ${
              activeTab === 'interests'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted'
            }`}
          >
            Interest Rates
          </button>
          <button
            onClick={() => setActiveTab('fees')}
            className={`py-2 px-4 font-semibold ${
              activeTab === 'fees' ? 'border-b-2 border-primary text-primary' : 'text-muted'
            }`}
          >
            Fees
          </button>
        </div>

        {showForm && (
          <>
            {activeTab === 'interests' && (
              <div className="space-y-4 mb-6 p-4 bg-black/5 rounded-lg">
                <h3 className="font-semibold">Add Interest Rate</h3>
                <div className="grid gap-3 max-w-md">
                  <Input
                    placeholder="Product Type (e.g., SAVINGS, FD, RD)"
                    value={interestForm.productType}
                    onChange={(e) =>
                      setInterestForm({ ...interestForm, productType: e.target.value })
                    }
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Annual Rate (%)"
                    value={interestForm.annualRate}
                    onChange={(e) =>
                      setInterestForm({ ...interestForm, annualRate: e.target.value })
                    }
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={interestForm.active}
                      onChange={(e) =>
                        setInterestForm({ ...interestForm, active: e.target.checked })
                      }
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                  <Button
                    onClick={() => createInterestMut.mutate()}
                    disabled={createInterestMut.isPending || !interestForm.productType}
                    className="gap-2"
                    variant="primary"
                  >
                    {createInterestMut.isPending && <Spinner className="h-4 w-4" />}
                    Create Interest Rate
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'fees' && (
              <div className="space-y-4 mb-6 p-4 bg-black/5 rounded-lg">
                <h3 className="font-semibold">Add Fee</h3>
                <div className="grid gap-3 max-w-md">
                  <Input
                    placeholder="Fee Code (e.g., ATM_CHARGES, TRANSFER_FEE)"
                    value={feeForm.code}
                    onChange={(e) => setFeeForm({ ...feeForm, code: e.target.value })}
                  />
                  <Input
                    placeholder="Description"
                    value={feeForm.description}
                    onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Amount (Fixed)"
                    value={feeForm.amount}
                    onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Percentage"
                    value={feeForm.percentage}
                    onChange={(e) => setFeeForm({ ...feeForm, percentage: e.target.value })}
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={feeForm.active}
                      onChange={(e) => setFeeForm({ ...feeForm, active: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                  <Button
                    onClick={() => createFeeMut.mutate()}
                    disabled={createFeeMut.isPending || !feeForm.code}
                    className="gap-2"
                    variant="primary"
                  >
                    {createFeeMut.isPending && <Spinner className="h-4 w-4" />}
                    Create Fee
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'interests' && (
          <>
            {interestsQ.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Spinner /> Loading...
              </div>
            ) : interests.length ? (
              <div className="space-y-3">
                <h3 className="font-semibold">Interest Rates ({interests.length})</h3>
                {interests.map((i) => (
                  <div
                    key={i.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-black/5"
                  >
                    <div>
                      <p className="font-semibold">{i.productType}</p>
                      <p className="text-sm text-muted">{i.annualRate}% p.a.</p>
                    </div>
                    <Badge tone={i.active ? 'success' : 'neutral'}>
                      {i.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No interest rates configured</p>
            )}
          </>
        )}

        {activeTab === 'fees' && (
          <>
            {feesQ.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Spinner /> Loading...
              </div>
            ) : fees.length ? (
              <div className="space-y-3">
                <h3 className="font-semibold">Fee Configurations ({fees.length})</h3>
                {fees.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-black/5"
                  >
                    <div>
                      <p className="font-semibold">{f.code}</p>
                      <p className="text-sm text-muted">{f.description}</p>
                      <p className="text-xs text-muted mt-1">
                        {f.amount > 0 && `₹${f.amount}`}
                        {f.amount > 0 && f.percentage > 0 && ' + '}
                        {f.percentage > 0 && `${f.percentage}%`}
                      </p>
                    </div>
                    <Badge tone={f.active ? 'success' : 'neutral'}>
                      {f.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No fees configured</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
