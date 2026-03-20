import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import type {
  AccountStatusFilter,
  CustomerStatus,
  KycStatus,
  RiskProfile,
} from '../../api/customers'
import { blockCustomer, searchCustomers, unblockCustomer } from '../../api/customers'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Pagination } from '../../components/ui/Pagination'
import { Spinner } from '../../components/ui/Spinner'
import { errorMessage } from '../../lib/errorMessage'
import { useAuthStore } from '../../store/auth'

const KYC: Array<KycStatus | 'ALL'> = ['ALL', 'PENDING', 'IN_PROGRESS', 'VERIFIED', 'REJECTED']
const RISK: Array<RiskProfile | 'ALL'> = ['ALL', 'LOW', 'MEDIUM', 'HIGH']
const STATUS: Array<CustomerStatus | 'ALL'> = [
  'ALL',
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'BLACKLISTED',
  'CLOSED',
  'ARCHIVED',
]
const ACC: Array<AccountStatusFilter | 'ALL'> = [
  'ALL',
  'PENDING_APPROVAL',
  'ACTIVE',
  'DORMANT',
  'FREEZED',
  'BLOCKED',
  'CLOSED',
]

export default function OpsCustomersPage() {
  const roles = useAuthStore((s) => s.roles)
  const isAdmin = roles.includes('ROLE_ADMIN')

  const [page, setPage] = useState(0)
  const [branchId, setBranchId] = useState('')
  const [kycStatus, setKycStatus] = useState<KycStatus | 'ALL'>('ALL')
  const [riskProfile, setRiskProfile] = useState<RiskProfile | 'ALL'>('ALL')
  const [status, setStatus] = useState<CustomerStatus | 'ALL'>('ALL')
  const [accountStatus, setAccountStatus] = useState<AccountStatusFilter | 'ALL'>('ALL')
  const [remarkById, setRemarkById] = useState<Record<number, string>>({})

  const params = useMemo(() => {
    const b = Number(branchId)
    return {
      branchId: branchId && Number.isFinite(b) ? b : undefined,
      kycStatus: kycStatus === 'ALL' ? undefined : kycStatus,
      riskProfile: riskProfile === 'ALL' ? undefined : riskProfile,
      status: status === 'ALL' ? undefined : status,
      accountStatus: accountStatus === 'ALL' ? undefined : accountStatus,
    }
  }, [accountStatus, branchId, kycStatus, riskProfile, status])

  const q = useQuery({
    queryKey: ['customers', 'search', params, page],
    queryFn: () => searchCustomers({ ...params, page, size: 20 }),
  })

  const blockM = useMutation({
    mutationFn: async (id: number) => blockCustomer(id, remarkById[id] ?? 'Blocked'),
    onSuccess: () => {
      toast.success('Customer blocked')
      void q.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const unblockM = useMutation({
    mutationFn: async (id: number) => unblockCustomer(id, remarkById[id] ?? 'Unblocked'),
    onSuccess: () => {
      toast.success('Customer unblocked')
      void q.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const items = q.data?.content ?? []

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Ops</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Customers</h1>
          <p className="mt-1 text-sm text-muted">Search + filter by KYC/risk/status.</p>
        </div>
        <Badge tone="neutral">{q.data?.totalElements ?? 0} results</Badge>
      </header>

      <section className="surface p-6">
        <div className="grid gap-3 lg:grid-cols-5">
          <Input
            placeholder="Branch ID"
            value={branchId}
            onChange={(e) => {
              setBranchId(e.target.value)
              setPage(0)
            }}
          />

          <select
            className="h-11 rounded-lg bg-white px-3 text-sm font-semibold ring-1 ring-black/10"
            value={kycStatus}
            onChange={(e) => {
              setKycStatus(e.target.value as KycStatus | 'ALL')
              setPage(0)
            }}
          >
            {KYC.map((s) => (
              <option key={s} value={s}>
                KYC: {s}
              </option>
            ))}
          </select>

          <select
            className="h-11 rounded-lg bg-white px-3 text-sm font-semibold ring-1 ring-black/10"
            value={riskProfile}
            onChange={(e) => {
              setRiskProfile(e.target.value as RiskProfile | 'ALL')
              setPage(0)
            }}
          >
            {RISK.map((s) => (
              <option key={s} value={s}>
                Risk: {s}
              </option>
            ))}
          </select>

          <select
            className="h-11 rounded-lg bg-white px-3 text-sm font-semibold ring-1 ring-black/10"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as CustomerStatus | 'ALL')
              setPage(0)
            }}
          >
            {STATUS.map((s) => (
              <option key={s} value={s}>
                Status: {s}
              </option>
            ))}
          </select>

          <select
            className="h-11 rounded-lg bg-white px-3 text-sm font-semibold ring-1 ring-black/10"
            value={accountStatus}
            onChange={(e) => {
              setAccountStatus(e.target.value as AccountStatusFilter | 'ALL')
              setPage(0)
            }}
          >
            {ACC.map((s) => (
              <option key={s} value={s}>
                Account: {s}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="surface p-6">
        {q.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Spinner /> Loading customers...
          </div>
        ) : items.length ? (
          <div className="grid gap-3">
            {items.map((c) => (
              <div
                key={c.id}
                className="grid gap-3 rounded-xl bg-black/5 p-4 lg:grid-cols-[1fr_320px]"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {c.fullName} • {c.customerCode}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {c.email} • {c.phone}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Branch {c.branchCode} • KYC {c.kycStatus} • Risk {c.riskProfile}
                  </p>
                  <p className="mt-1 text-xs text-muted">Status: {c.status}</p>
                </div>

                <div className="space-y-2">
                  <Input
                    placeholder="Remark (admin actions)"
                    value={remarkById[c.id] ?? ''}
                    onChange={(e) =>
                      setRemarkById((s) => ({ ...s, [c.id]: e.target.value }))
                    }
                    disabled={!isAdmin}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => blockM.mutate(c.id)}
                      disabled={!isAdmin || blockM.isPending || unblockM.isPending}
                    >
                      Block
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => unblockM.mutate(c.id)}
                      disabled={!isAdmin || blockM.isPending || unblockM.isPending}
                    >
                      Unblock
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No customers found.</p>
        )}

        <div className="mt-6">
          <Pagination
            page={q.data?.page ?? 0}
            totalPages={q.data?.totalPages ?? 1}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </section>
    </div>
  )
}

