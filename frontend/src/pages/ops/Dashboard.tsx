import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { adminDashboardReport } from '../../api/admin'
import { assignedCustomers, employeeFraudCases } from '../../api/employee'
import { listFraudCases } from '../../api/fraud'
import { pendingTransfers } from '../../api/manager'
import { queueSummary } from '../../api/notificationsAdmin'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { useAuthStore } from '../../store/auth'

export default function OpsDashboardPage() {
  const roles = useAuthStore((s) => s.roles)
  const isAdmin = roles.includes('ROLE_ADMIN')
  const isManager = roles.includes('ROLE_MANAGER')
  const isEmployee = roles.includes('ROLE_EMPLOYEE')
  const isAuditor = roles.includes('ROLE_AUDITOR')

  const dashQ = useQuery({
    enabled: isAdmin || isAuditor,
    queryKey: ['admin', 'reports', 'dashboard'],
    queryFn: adminDashboardReport,
  })

  const pendingQ = useQuery({
    enabled: isManager || isAdmin,
    queryKey: ['manager', 'transfers', 'pending'],
    queryFn: pendingTransfers,
  })

  const assignedQ = useQuery({
    enabled: isEmployee,
    queryKey: ['employee', 'customers', 'assigned'],
    queryFn: () => assignedCustomers({ page: 0, size: 1 }),
  })

  const fraudQ = useQuery({
    enabled: isAdmin || isManager || isEmployee || isAuditor,
    queryKey: ['fraud', 'cases', isEmployee && !isAdmin ? 'employee' : 'all'],
    queryFn: () => (isEmployee && !isAdmin ? employeeFraudCases() : listFraudCases()),
  })

  const notifQ = useQuery({
    enabled: isAdmin,
    queryKey: ['notifications', 'admin', 'summary'],
    queryFn: queueSummary,
  })

  return (
    <div className="space-y-6">
      <header>
        <p className="chip">Operations console</p>
        <h1 className="mt-3 font-display text-2xl font-semibold">Ops Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Your roles: {roles.join(', ') || '—'}</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-4">
        {(isAdmin || isAuditor) && (
          <div className="surface p-5">
            <p className="text-xs font-semibold text-muted">Total customers</p>
            <p className="mt-2 font-display text-2xl font-semibold">
              {dashQ.isLoading ? '—' : String(dashQ.data?.totalCustomers ?? 0)}
            </p>
          </div>
        )}

        {(isAdmin || isAuditor) && (
          <div className="surface p-5">
            <p className="text-xs font-semibold text-muted">Active accounts</p>
            <p className="mt-2 font-display text-2xl font-semibold">
              {dashQ.isLoading ? '—' : String(dashQ.data?.totalActiveAccounts ?? 0)}
            </p>
          </div>
        )}

        {(isManager || isAdmin) && (
          <div className="surface p-5">
            <p className="text-xs font-semibold text-muted">Pending approvals</p>
            <p className="mt-2 font-display text-2xl font-semibold">
              {pendingQ.isLoading ? '—' : String(pendingQ.data?.length ?? 0)}
            </p>
          </div>
        )}

        {isEmployee && (
          <div className="surface p-5">
            <p className="text-xs font-semibold text-muted">Assigned customers</p>
            <p className="mt-2 font-display text-2xl font-semibold">
              {assignedQ.isLoading ? '—' : String(assignedQ.data?.totalElements ?? 0)}
            </p>
          </div>
        )}

        {(isAdmin || isManager || isEmployee || isAuditor) && (
          <div className="surface p-5">
            <p className="text-xs font-semibold text-muted">Fraud cases</p>
            <p className="mt-2 font-display text-2xl font-semibold">
              {fraudQ.isLoading ? '—' : String(fraudQ.data?.length ?? 0)}
            </p>
          </div>
        )}

        {isAdmin && (
          <div className="surface p-5">
            <p className="text-xs font-semibold text-muted">Notification failures</p>
            <p className="mt-2 font-display text-2xl font-semibold">
              {notifQ.isLoading ? '—' : String(notifQ.data?.failedCount ?? 0)}
            </p>
          </div>
        )}
      </section>

      <section className="surface p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Quick links</h2>
            <p className="text-sm text-muted">Jump into ops modules.</p>
          </div>
          <Badge tone="neutral">UI wired</Badge>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(isAdmin || isManager) && (
            <Link className="rounded-xl bg-black/5 p-4 hover:bg-black/10" to="/ops/approvals/transfers">
              <p className="text-sm font-semibold">Transfer approvals</p>
              <p className="mt-1 text-xs text-muted">Maker-checker queue</p>
            </Link>
          )}
          <Link className="rounded-xl bg-black/5 p-4 hover:bg-black/10" to="/ops/fraud">
            <p className="text-sm font-semibold">Fraud cases</p>
            <p className="mt-1 text-xs text-muted">Review and resolve</p>
          </Link>
          {(isAdmin || isAuditor) && (
            <Link className="rounded-xl bg-black/5 p-4 hover:bg-black/10" to="/ops/audit">
              <p className="text-sm font-semibold">Audit logs</p>
              <p className="mt-1 text-xs text-muted">Security trail</p>
            </Link>
          )}
          {(isAdmin || isAuditor) && (
            <Link className="rounded-xl bg-black/5 p-4 hover:bg-black/10" to="/ops/reports">
              <p className="text-sm font-semibold">Reports</p>
              <p className="mt-1 text-xs text-muted">Volume, revenue, performance</p>
            </Link>
          )}
          {(isAdmin) && (
            <Link className="rounded-xl bg-black/5 p-4 hover:bg-black/10" to="/ops/notifications">
              <p className="text-sm font-semibold">Notification queue</p>
              <p className="mt-1 text-xs text-muted">DLQ export + retry</p>
            </Link>
          )}
          <Link className="rounded-xl bg-black/5 p-4 hover:bg-black/10" to="/ops/disputes">
            <p className="text-sm font-semibold">Disputes</p>
            <p className="mt-1 text-xs text-muted">Chargeback workflow</p>
          </Link>
          {(isAdmin || isManager || isEmployee) && (
            <Link className="rounded-xl bg-black/5 p-4 hover:bg-black/10" to="/ops/customers">
              <p className="text-sm font-semibold">Customers</p>
              <p className="mt-1 text-xs text-muted">Search and status</p>
            </Link>
          )}
          {isAdmin && (
            <Link className="rounded-xl bg-black/5 p-4 hover:bg-black/10" to="/ops/branches">
              <p className="text-sm font-semibold">Branches</p>
              <p className="mt-1 text-xs text-muted">Directory management</p>
            </Link>
          )}
          {isAdmin && (
            <Link className="rounded-xl bg-black/5 p-4 hover:bg-black/10" to="/ops/monitoring">
              <p className="text-sm font-semibold">Monitoring</p>
              <p className="mt-1 text-xs text-muted">System counters</p>
            </Link>
          )}
        </div>

        {(dashQ.isLoading || pendingQ.isLoading || fraudQ.isLoading || notifQ.isLoading) && (
          <div className="mt-5 flex items-center gap-2 text-sm text-muted">
            <Spinner /> Loading dashboard widgets...
          </div>
        )}
      </section>
    </div>
  )
}
