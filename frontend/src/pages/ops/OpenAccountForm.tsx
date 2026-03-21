import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'

import { listBranches, type BranchResponse } from '../../api/admin'
import { openAccount } from '../../api/accounts'
import { searchCustomers, type CustomerResponse } from '../../api/customers'
import type { ApiErrorResponse } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'

const schema = z.object({
  primaryCustomerId: z.coerce.number().min(1, 'Customer is required'),
  branchId: z.coerce.number().min(1, 'Branch is required'),
  accountType: z.enum(['SAVINGS', 'CURRENT', 'SALARY']).default('SAVINGS'),
  currency: z.string().default('INR'),
  openingBalance: z.coerce.number().min(0, 'Must be >= 0').default(0),
  minimumBalance: z.coerce.number().min(0, 'Must be >= 0').default(0),
  interestRate: z.coerce.number().min(0, 'Must be >= 0').default(0),
  overdraftLimit: z.coerce.number().min(0, 'Must be >= 0').default(0),
})

export default function OpenAccountForm() {
  const nav = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  } as any)

  // Fetch customers
  const customersQ = useQuery({
    queryKey: ['customers', 'search'],
    queryFn: () => searchCustomers({ page: 0, size: 1000, status: 'ACTIVE' }),
  })

  // Fetch branches
  const branchesQ = useQuery({
    queryKey: ['branches'],
    queryFn: () => listBranches({ status: 'ACTIVE', page: 0, size: 1000 }),
  })

  async function onSubmit(data: any) {
    try {
      const result = await openAccount(data)
      toast.success(`Account opened successfully! Account #: ${result.accountNumber}`)
      nav('/ops/customers')
    } catch (error) {
      const apiError = error as ApiErrorResponse
      toast.error(apiError.message || 'Failed to open account')
    }
  }

  const customers = customersQ.data?.content ?? []
  const branches = branchesQ.data?.content ?? []

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => nav(-1)}
          className="rounded-lg p-2 hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-2xl font-semibold">Open New Account</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-lg bg-surface p-6">
        {/* Primary Customer */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Primary Customer <span className="text-error">*</span>
          </label>
          <select
            {...register('primaryCustomerId')}
            className="w-full rounded-lg border border-muted bg-paper px-4 py-2 text-ink focus:border-primary focus:outline-none"
          >
            <option value="">Select a customer...</option>
            {customersQ.isLoading && <option disabled>Loading customers...</option>}
            {customers.map((c: CustomerResponse) => (
              <option key={c.id} value={c.id}>
                {c.fullName} ({c.customerCode})
              </option>
            ))}
          </select>
          {errors.primaryCustomerId && (
            <p className="mt-1 text-xs text-error">{(errors.primaryCustomerId as any)?.message}</p>
          )}
        </div>

        {/* Branch */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Branch <span className="text-error">*</span>
          </label>
          <select
            {...register('branchId')}
            className="w-full rounded-lg border border-muted bg-paper px-4 py-2 text-ink focus:border-primary focus:outline-none"
          >
            <option value="">Select a branch...</option>
            {branchesQ.isLoading && <option disabled>Loading branches...</option>}
            {branches.map((b: BranchResponse) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.branchCode})
              </option>
            ))}
          </select>
          {errors.branchId && (
            <p className="mt-1 text-xs text-error">{(errors.branchId as any)?.message}</p>
          )}
        </div>

        {/* Account Type */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Account Type <span className="text-error">*</span>
          </label>
          <select
            {...register('accountType')}
            className="w-full rounded-lg border border-muted bg-paper px-4 py-2 text-ink focus:border-primary focus:outline-none"
          >
            <option value="">Select account type...</option>
            <option value="SAVINGS">Savings Account</option>
            <option value="CURRENT">Current Account</option>
            <option value="SALARY">Salary Account</option>
          </select>
          {errors.accountType && (
            <p className="mt-1 text-xs text-error">{(errors.accountType as any)?.message}</p>
          )}
        </div>

        {/* Currency */}
        <div>
          <label className="mb-2 block text-sm font-medium">Currency</label>
          <input
            {...register('currency')}
            type="text"
            placeholder="INR"
            className="w-full rounded-lg border border-muted bg-paper px-4 py-2 text-ink focus:border-primary focus:outline-none"
          />
        </div>

        {/* Opening Balance */}
        <div>
          <label className="mb-2 block text-sm font-medium">Opening Balance (₹)</label>
          <Input {...register('openingBalance')} type="number" placeholder="0" step="0.01" />
          {errors.openingBalance && (
            <p className="mt-1 text-xs text-error">{(errors.openingBalance as any)?.message}</p>
          )}
        </div>

        {/* Minimum Balance */}
        <div>
          <label className="mb-2 block text-sm font-medium">Minimum Balance (₹)</label>
          <Input {...register('minimumBalance')} type="number" placeholder="0" step="0.01" />
          {errors.minimumBalance && (
            <p className="mt-1 text-xs text-error">{(errors.minimumBalance as any)?.message}</p>
          )}
        </div>

        {/* Interest Rate */}
        <div>
          <label className="mb-2 block text-sm font-medium">Interest Rate (% p.a.)</label>
          <Input
            {...register('interestRate')}
            type="number"
            placeholder="0"
            step="0.01"
          />
          {errors.interestRate && (
            <p className="mt-1 text-xs text-error">{(errors.interestRate as any)?.message}</p>
          )}
        </div>

        {/* Overdraft Limit */}
        <div>
          <label className="mb-2 block text-sm font-medium">Overdraft Limit (₹)</label>
          <Input {...register('overdraftLimit')} type="number" placeholder="0" step="0.01" />
          {errors.overdraftLimit && (
            <p className="mt-1 text-xs text-error">{(errors.overdraftLimit as any)?.message}</p>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => nav(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner /> Creating...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 rounded-lg border border-success bg-success bg-opacity-5 p-4">
        <p className="text-sm font-medium text-success">ℹ New Account Status</p>
        <p className="mt-1 text-xs text-muted">
          New accounts will be created with status <strong>PENDING_APPROVAL</strong>. They need
          to be approved by Manager/Admin before they become ACTIVE.
        </p>
      </div>
    </div>
  )
}
