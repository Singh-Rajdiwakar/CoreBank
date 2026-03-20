import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { employeeFraudCases } from '../../api/employee'
import type { FraudStatus } from '../../api/fraud'
import { listFraudCases, reviewFraudCase } from '../../api/fraud'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { errorMessage } from '../../lib/errorMessage'
import { useAuthStore } from '../../store/auth'

const STATUSES: FraudStatus[] = [
  'CLEAR',
  'UNDER_REVIEW',
  'SUSPICIOUS',
  'BLOCKED',
  'ESCALATED',
  'RESOLVED',
]

export default function OpsFraudCasesPage() {
  const roles = useAuthStore((s) => s.roles)
  const isEmployeeOnly = roles.includes('ROLE_EMPLOYEE') && !roles.includes('ROLE_ADMIN')

  const q = useQuery({
    queryKey: ['fraud', 'cases', isEmployeeOnly ? 'employee' : 'all'],
    queryFn: () => (isEmployeeOnly ? employeeFraudCases() : listFraudCases()),
  })

  const [statusById, setStatusById] = useState<Record<number, FraudStatus>>({})
  const [notesById, setNotesById] = useState<Record<number, string>>({})

  const reviewM = useMutation({
    mutationFn: async (id: number) =>
      reviewFraudCase(id, {
        status: statusById[id] ?? 'UNDER_REVIEW',
        notes: notesById[id] ?? 'Reviewed in ops console',
      }),
    onSuccess: () => {
      toast.success('Fraud case updated')
      void q.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const canReview = useMemo(() => roles.length > 0, [roles])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Fraud</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Fraud cases</h1>
          <p className="mt-1 text-sm text-muted">
            Review queue from `/api/fraud/cases` (or employee view).
          </p>
        </div>
        <Badge tone="neutral">{q.data?.length ?? 0} cases</Badge>
      </header>

      <div className="surface p-6">
        {q.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Spinner /> Loading fraud cases...
          </div>
        ) : q.data?.length ? (
          <div className="grid gap-3">
            {q.data.map((c) => (
              <div key={c.id} className="rounded-xl bg-black/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Case #{c.id}</p>
                    <p className="mt-1 text-xs text-muted">
                      Txn ID: <span className="font-mono">{c.transactionId}</span>
                    </p>
                    <p className="mt-1 text-xs text-muted">{c.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">Score: {c.score}</p>
                    <p className="mt-1 text-xs text-muted">{c.status}</p>
                  </div>
                </div>

                {canReview ? (
                  <div className="mt-4 grid gap-3 lg:grid-cols-[180px_1fr_auto] lg:items-center">
                    <select
                      className="h-11 rounded-lg bg-white px-3 text-sm font-semibold ring-1 ring-black/10"
                      value={statusById[c.id] ?? c.status}
                      onChange={(e) =>
                        setStatusById((s) => ({
                          ...s,
                          [c.id]: e.target.value as FraudStatus,
                        }))
                      }
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <Input
                      placeholder="Notes"
                      value={notesById[c.id] ?? ''}
                      onChange={(e) =>
                        setNotesById((s) => ({ ...s, [c.id]: e.target.value }))
                      }
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => reviewM.mutate(c.id)}
                      disabled={reviewM.isPending}
                    >
                      Update
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No fraud cases.</p>
        )}
      </div>
    </div>
  )
}

