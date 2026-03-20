import {
  Activity,
  BarChart3,
  Building2,
  GitPullRequest,
  LayoutDashboard,
  LogOut,
  Scale,
  Shield,
  ShieldAlert,
  Users,
} from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'

import { logout as logoutApi } from '../../api/auth'
import { Button } from '../../components/ui/Button'
import { cn } from '../../lib/cn'
import { useAuthStore } from '../../store/auth'

export default function OpsLayout() {
  const nav = useNavigate()
  const clear = useAuthStore((s) => s.clear)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const username = useAuthStore((s) => s.username)
  const roles = useAuthStore((s) => s.roles)
  const isAdmin = roles.includes('ROLE_ADMIN')
  const isManager = roles.includes('ROLE_MANAGER')
  const isEmployee = roles.includes('ROLE_EMPLOYEE')
  const isAuditor = roles.includes('ROLE_AUDITOR')

  async function doLogout() {
    try {
      if (refreshToken) await logoutApi(refreshToken)
    } catch {
      // ignore
    } finally {
      clear()
      nav('/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="surface p-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <Link to="/ops" className="block rounded-xl bg-black/5 p-4">
            <p className="font-display text-lg font-semibold">Ops</p>
            <p className="mt-1 text-xs text-muted">Signed in as {username ?? '—'}</p>
            <p className="mt-1 text-xs text-muted">{roles.join(', ')}</p>
          </Link>

          <nav className="mt-4 grid gap-1">
            <NavLink
              to="/ops"
              end
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                  isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                )
              }
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>

            {(isAdmin || isManager) && (
              <NavLink
                to="/ops/approvals/transfers"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                    isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                  )
                }
              >
                <GitPullRequest className="h-4 w-4" />
                Approvals
              </NavLink>
            )}

            <NavLink
              to="/ops/fraud"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                  isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                )
              }
            >
              <ShieldAlert className="h-4 w-4" />
              Fraud cases
            </NavLink>

            <NavLink
              to="/ops/disputes"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                  isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                )
              }
            >
              <Scale className="h-4 w-4" />
              Disputes
            </NavLink>

            {(isAdmin || isManager || isEmployee) && (
              <NavLink
                to="/ops/customers"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                    isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                  )
                }
              >
                <Users className="h-4 w-4" />
                Customers
              </NavLink>
            )}

            {(isAdmin || isAuditor) && (
              <NavLink
                to="/ops/audit"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                    isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                  )
                }
              >
                <Activity className="h-4 w-4" />
                Audit logs
              </NavLink>
            )}

            {(isAdmin || isAuditor) && (
              <NavLink
                to="/ops/reports"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                    isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                  )
                }
              >
                <BarChart3 className="h-4 w-4" />
                Reports
              </NavLink>
            )}

            {isAdmin && (
              <NavLink
                to="/ops/branches"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                    isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                  )
                }
              >
                <Building2 className="h-4 w-4" />
                Branches
              </NavLink>
            )}

            {isAdmin && (
              <NavLink
                to="/ops/notifications"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                    isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                  )
                }
              >
                <Shield className="h-4 w-4" />
                Notifications
              </NavLink>
            )}

            {isAdmin && (
              <NavLink
                to="/ops/monitoring"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                    isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                  )
                }
              >
                <Activity className="h-4 w-4" />
                Monitoring
              </NavLink>
            )}

            <a
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-black/5"
              href="http://localhost:8080/swagger-ui/index.html"
              target="_blank"
              rel="noreferrer"
            >
              <Shield className="h-4 w-4" />
              Swagger
            </a>
          </nav>

          <div className="mt-6 border-t border-black/10 pt-4">
            <Button variant="ghost" className="w-full justify-start" onClick={doLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
