import { Button } from './Button'

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (next: number) => void
}) {
  const prevDisabled = page <= 0
  const nextDisabled = totalPages <= 0 || page >= totalPages - 1

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs font-semibold text-muted">
        Page <span className="font-mono">{page + 1}</span> of{' '}
        <span className="font-mono">{Math.max(totalPages, 1)}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={prevDisabled}
        >
          Prev
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={nextDisabled}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

