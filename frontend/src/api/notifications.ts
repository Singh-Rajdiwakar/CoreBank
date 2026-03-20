import { http } from './http'
import type { ApiResponse, PageResponse } from './types'

export type NotificationResponse = {
  id: number
  type: string
  channel: 'EMAIL' | 'SMS' | 'IN_APP'
  status: 'PENDING' | 'SENT' | 'FAILED'
  title: string
  message: string
  sentAt?: string
  deliveredAt?: string
  attemptCount?: number
  lastError?: string
  readFlag?: boolean
  readAt?: string
  createdAt?: string
}

export async function myNotifications(params?: {
  page?: number
  size?: number
}): Promise<PageResponse<NotificationResponse>> {
  const res = await http.get<ApiResponse<PageResponse<NotificationResponse>>>(
    '/notifications/me',
    {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 50,
      },
    },
  )
  return res.data.data
}

export async function unreadCount(): Promise<Record<string, number>> {
  const res = await http.get<ApiResponse<Record<string, number>>>(
    '/notifications/unread-count',
  )
  return res.data.data
}

