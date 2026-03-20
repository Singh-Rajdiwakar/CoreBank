import { useQuery } from '@tanstack/react-query'

import { monitoring } from '../../api/admin'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'

export default function OpsMonitoringPage() {
  const q = useQuery({
    queryKey: ['admin', 'monitoring'],
    queryFn: monitoring,
  })

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Admin</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Monitoring</h1>
          <p className="mt-1 text-sm text-muted">System signals and counters.</p>
        </div>
        <Badge tone="neutral">/api/admin/monitoring</Badge>
      </header>

      <div className="surface p-6">
        {q.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Spinner /> Loading monitoring...
          </div>
        ) : (
          <pre className="max-h-[520px] overflow-auto rounded-lg bg-black/5 p-4 text-xs">
            {JSON.stringify(q.data ?? {}, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}

