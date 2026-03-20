import { useQuery } from '@tanstack/react-query'

import { myNotifications, unreadCount } from '../../api/notifications'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { formatDateTime } from '../../lib/format'

export default function CustomerNotificationsPage() {
  const listQ = useQuery({
    queryKey: ['notifications', { page: 0, size: 50 }],
    queryFn: () => myNotifications({ page: 0, size: 50 }),
  })

  const unreadQ = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: unreadCount,
  })

  const items = listQ.data?.content ?? []
  const unread = unreadQ.data?.IN_APP ?? 0

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Customer</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Notifications</h1>
          <p className="mt-1 text-sm text-muted">Fetched from `/api/notifications/me`.</p>
        </div>
        <Badge tone={unread ? 'warning' : 'neutral'}>{unread} unread</Badge>
      </header>

      <div className="surface p-6">
        {listQ.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Spinner /> Loading notifications...
          </div>
        ) : items.length ? (
          <div className="grid gap-3">
            {items.map((n) => (
              <div key={n.id} className="rounded-xl bg-black/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="neutral">{n.channel}</Badge>
                    <Badge tone={n.readFlag ? 'neutral' : 'warning'}>
                      {n.readFlag ? 'READ' : 'UNREAD'}
                    </Badge>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted">{n.message}</p>
                <p className="mt-2 text-xs text-muted">
                  {formatDateTime(n.createdAt ?? n.sentAt)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No notifications.</p>
        )}
      </div>
    </div>
  )
}

