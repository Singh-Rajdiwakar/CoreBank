import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import type { BranchStatus, CreateBranchRequest } from '../../api/admin'
import { createBranch, listBranches } from '../../api/admin'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Pagination } from '../../components/ui/Pagination'
import { Spinner } from '../../components/ui/Spinner'
import { errorMessage } from '../../lib/errorMessage'

export default function OpsBranchesPage() {
  const [status, setStatus] = useState<BranchStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(0)
  const [showCreate, setShowCreate] = useState(false)

  const q = useQuery({
    queryKey: ['admin', 'branches', { status, page }],
    queryFn: () =>
      listBranches({
        status: status === 'ALL' ? undefined : status,
        page,
        size: 20,
      }),
  })

  const [draft, setDraft] = useState<CreateBranchRequest>({
    name: '',
    branchCode: '',
    ifscCode: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    contactEmail: '',
    contactPhone: '',
  })

  const createM = useMutation({
    mutationFn: () => createBranch(draft),
    onSuccess: () => {
      toast.success('Branch created')
      setShowCreate(false)
      setDraft({
        name: '',
        branchCode: '',
        ifscCode: '',
        addressLine1: '',
        city: '',
        state: '',
        postalCode: '',
        contactEmail: '',
        contactPhone: '',
      })
      void q.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const items = q.data?.content ?? []

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Admin</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Branches</h1>
          <p className="mt-1 text-sm text-muted">Branch directory + manager mapping.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-11 rounded-lg bg-white px-3 text-sm font-semibold ring-1 ring-black/10"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as BranchStatus | 'ALL')
              setPage(0)
            }}
          >
            <option value="ALL">ALL</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
          <Button type="button" onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? 'Close' : 'New branch'}
          </Button>
        </div>
      </header>

      {showCreate ? (
        <div className="surface p-6">
          <h2 className="font-display text-lg font-semibold">Create branch</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <Input
              placeholder="Name"
              value={draft.name}
              onChange={(e) => setDraft((s) => ({ ...s, name: e.target.value }))}
            />
            <Input
              placeholder="Branch code"
              value={draft.branchCode}
              onChange={(e) => setDraft((s) => ({ ...s, branchCode: e.target.value }))}
            />
            <Input
              placeholder="IFSC code"
              value={draft.ifscCode}
              onChange={(e) => setDraft((s) => ({ ...s, ifscCode: e.target.value }))}
            />
            <Input
              placeholder="Address line 1"
              value={draft.addressLine1}
              onChange={(e) => setDraft((s) => ({ ...s, addressLine1: e.target.value }))}
            />
            <Input
              placeholder="City"
              value={draft.city}
              onChange={(e) => setDraft((s) => ({ ...s, city: e.target.value }))}
            />
            <Input
              placeholder="State"
              value={draft.state}
              onChange={(e) => setDraft((s) => ({ ...s, state: e.target.value }))}
            />
            <Input
              placeholder="Postal code"
              value={draft.postalCode}
              onChange={(e) => setDraft((s) => ({ ...s, postalCode: e.target.value }))}
            />
            <Input
              placeholder="Contact email"
              value={draft.contactEmail}
              onChange={(e) => setDraft((s) => ({ ...s, contactEmail: e.target.value }))}
            />
            <Input
              placeholder="Contact phone"
              value={draft.contactPhone}
              onChange={(e) => setDraft((s) => ({ ...s, contactPhone: e.target.value }))}
            />
            <Input
              placeholder="Manager userId (optional)"
              value={draft.managerUserId ?? ''}
              onChange={(e) =>
                setDraft((s) => ({
                  ...s,
                  managerUserId: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </div>
          <div className="mt-5">
            <Button type="button" onClick={() => createM.mutate()} disabled={createM.isPending}>
              {createM.isPending ? (
                <>
                  <Spinner /> Creating...
                </>
              ) : (
                'Create branch'
              )}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Directory</h2>
          <Badge tone="neutral">{q.data?.totalElements ?? 0}</Badge>
        </div>

        <div className="mt-4">
          {q.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Spinner /> Loading branches...
            </div>
          ) : items.length ? (
            <div className="grid gap-3">
              {items.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-black/5 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {b.name} • {b.branchCode}
                    </p>
                    <p className="mt-1 text-xs text-muted">{b.ifscCode}</p>
                    <p className="mt-1 text-xs text-muted">
                      {b.city}, {b.state}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-muted">{b.status}</p>
                    <p className="mt-1 text-xs text-muted">manager: {b.managerUserId ?? '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No branches found.</p>
          )}
        </div>

        <div className="mt-6">
          <Pagination
            page={q.data?.page ?? 0}
            totalPages={q.data?.totalPages ?? 1}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>
    </div>
  )
}

