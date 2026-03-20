import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        tone === 'neutral' && 'bg-black/5 text-ink',
        tone === 'success' && 'bg-emerald-100 text-emerald-900',
        tone === 'warning' && 'bg-amber-100 text-amber-900',
        tone === 'danger' && 'bg-rose-100 text-rose-900',
      )}
    >
      {children}
    </span>
  )
}
