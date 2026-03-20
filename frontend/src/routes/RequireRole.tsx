import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import type { Role } from '../store/auth'
import { useAuthStore } from '../store/auth'

export function RequireRole({
  anyOf,
  children,
}: {
  anyOf: Role[]
  children: ReactNode
}) {
  const roles = useAuthStore((s) => s.roles)

  const allowed = anyOf.some((r) => roles.includes(r))
  if (allowed) return children

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <div className="surface p-8">
          <p className="chip">403</p>
          <h1 className="mt-4 font-display text-2xl font-semibold">
            You do not have access to this area
          </h1>
          <p className="mt-2 text-sm text-muted">
            Your roles: {roles.length ? roles.join(', ') : '(none)'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft"
            >
              Go Home
            </Link>
            <Link
              to="/login"
              className="rounded-lg bg-black/5 px-4 py-2 text-sm font-semibold text-ink"
            >
              Switch Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
