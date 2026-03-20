import { Bell, CreditCard, LayoutDashboard, LogOut, Send, Banknote, Download, Users, Landmark, Home, TrendingUp, History, AlertCircle, Settings, Lock } from 'lucide-react'
import { useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'

import { logout as logoutApi } from '../../api/auth'
import { unreadCount } from '../../api/notifications'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { cn } from '../../lib/cn'
import { useAuthStore } from '../../store/auth'

export default function CustomerLayout() {
  const nav = useNavigate()
  const clear = useAuthStore((s) => s.clear)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const username = useAuthStore((s) => s.username)

  // Lightweight fetch for unread count; React Query is used inside pages.
  useEffect(() => {
    void unreadCount().catch(() => undefined)
  }, [])

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
        <aside className="surface p-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:overflow-y-auto">
          <Link to="/app" className="block rounded-xl bg-black/5 p-4">
            <p className="font-display text-lg font-semibold">Customer</p>
            <p className="mt-1 text-xs text-muted">Signed in as {username ?? '—'}</p>
          </Link>

          <nav className="mt-4 grid gap-1">
            <p className="px-3 py-2 text-xs font-semibold text-muted">MAIN</p>
            
            <NavLink
              to="/app"
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

            <NavLink
              to="/app/accounts"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                  isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                )
              }
            >
              <CreditCard className="h-4 w-4" />
              Accounts
            </NavLink>

            <p className="px-3 py-2 text-xs font-semibold text-muted">TRANSACTIONS</p>

            <NavLink
              to="/app/deposits"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                  isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                )
              }
            >
              <Download className="h-4 w-4" />
              Deposits
            </NavLink>

            <NavLink
              to="/app/withdrawals"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                  isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                )
              }
            >
              <Banknote className="h-4 w-4" />
              Withdrawals
            </NavLink>

            <NavLink
              to="/app/transfers"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                  isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                )
              }
            >
              <Send className="h-4 w-4" />
              Transfers
            </NavLink>

            <NavLink
              to="/app/transactions"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                  isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                )
              }
            >
              <History className="h-4 w-4" />
              History
            </NavLink>

            <NavLink
              to="/app/beneficiaries"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                  isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                )
              }
            >
              <Users className="h-4 w-4" />
              Beneficiaries
            </NavLink>

            <p className="px-3 py-2 text-xs font-semibold text-muted">PRODUCTS</p>

            <NavLink
              to="/app/cards"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                  isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                )
              }
            >
              <CreditCard className="h-4 w-4" />
              Cards
            </NavLink>

            <NavLink
              to="/app/loans"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                  isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                )
              }
            >
              <Landmark className="h-4 w-4" />
              Loans
            </NavLink>

            <NavLink
              to="/app/fd"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                  isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                )
              }
            >
              <Banknote className="h-4 w-4" />
              Fixed Deposits
            </NavLink>

            <NavLink
              to="/app/rd"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                  isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                )
              }
            >
              <TrendingUp className="h-4 w-4" />
              Rec. Deposits
            </NavLink>

            <p className="px-3 py-2 text-xs font-semibold text-muted">SUPPORT</p>

            <NavLink
              to="/app/disputes"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                  isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                )
              }
            >
              <AlertCircle className="h-4 w-4" />
              Disputes
            </NavLink>

            <NavLink
              to="/app/notifications"
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                  isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                )
              }
            >
              <span className="flex items-center gap-3">
                <Bell className="h-4 w-4" />
                Notifications
              </span>
            </NavLink>

            <p className="px-3 py-2 text-xs font-semibold text-muted">SETTINGS</p>

            <NavLink
              to="/app/profile"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                  isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                )
              }
            >
              <Settings className="h-4 w-4" />
              Profile
            </NavLink>

            <NavLink
              to="/app/transaction-pin"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold',
                  isActive ? 'bg-primary text-white' : 'hover:bg-black/5',
                )
              }
            >
              <Lock className="h-4 w-4" />
              Transaction PIN
            </NavLink>
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

