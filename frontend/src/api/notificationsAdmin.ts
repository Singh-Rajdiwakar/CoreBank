import { http } from './http'
import type { ApiResponse, PageResponse } from './types'
import type { NotificationResponse } from './notifications'

export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED'
export type NotificationChannel = 'EMAIL' | 'SMS' | 'IN_APP'

export type NotificationQueueSummaryResponse = {
  pendingCount: number
  failedCount: number
  sentCount: number
  dueRetryCount: number
}

export async function queueSummary(): Promise<NotificationQueueSummaryResponse> {
  const res = await http.get<ApiResponse<NotificationQueueSummaryResponse>>(
    '/notifications/admin/summary',
  )
  return res.data.data
}

export async function queueByStatus(
  status: NotificationStatus,
  params?: { page?: number; size?: number },
): Promise<PageResponse<NotificationResponse>> {
  const res = await http.get<ApiResponse<PageResponse<NotificationResponse>>>(
    '/notifications/admin/queue',
    {
      params: {
        status,
        page: params?.page ?? 0,
        size: params?.size ?? 50,
      },
    },
  )
  return res.data.data
}

export async function retryDispatch(channel?: NotificationChannel): Promise<Record<string, unknown>> {
  const res = await http.patch<ApiResponse<Record<string, unknown>>>(
    '/notifications/admin/retry-dispatch',
    null,
    { params: { channel } },
  )
  return res.data.data
}

export async function cleanupSent(): Promise<Record<string, number>> {
  const res = await http.delete<ApiResponse<Record<string, number>>>('/notifications/admin/cleanup')
  return res.data.data
}

export async function exportDeadLetterCsv(params?: {
  channel?: NotificationChannel
  limit?: number
}): Promise<Blob> {
  const res = await http.get('/notifications/admin/dead-letter/export', {
    params: {
      channel: params?.channel,
      limit: params?.limit ?? 1000,
    },
    responseType: 'blob',
  })
  return res.data as Blob
}

