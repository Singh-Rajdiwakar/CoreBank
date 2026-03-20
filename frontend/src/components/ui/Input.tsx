import type { InputHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type Props = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-lg bg-white px-3 text-sm text-ink ring-1 ring-black/10',
        'placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/35',
        className,
      )}
      {...props}
    />
  )
}

