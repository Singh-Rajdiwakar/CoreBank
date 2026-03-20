import type { ButtonHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition',
        'disabled:pointer-events-none disabled:opacity-60',
        size === 'sm' ? 'h-9 px-3 text-sm' : 'h-11 px-4 text-sm',
        variant === 'primary' &&
          'bg-primary text-white shadow-soft hover:bg-primary-600 active:bg-primary-700',
        variant === 'ghost' && 'bg-black/5 text-ink hover:bg-black/10',
        variant === 'danger' && 'bg-danger text-white hover:bg-[#9f1a10]',
        className,
      )}
      {...props}
    />
  )
}

