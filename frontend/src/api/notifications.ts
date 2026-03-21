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

export type NotificationPreferenceResponse = {
  transactionInAppEnabled: boolean
  transactionEmailEnabled: boolean
  transactionSmsEnabled: boolean
  securityInAppEnabled: boolean
  securityEmailEnabled: boolean
  securitySmsEnabled: boolean
  languageCode: string
}

export type UpdateNotificationPreferenceRequest = {
  transactionInAppEnabled?: boolean
  transactionEmailEnabled?: boolean
  transactionSmsEnabled?: boolean
  securityInAppEnabled?: boolean
  securityEmailEnabled?: boolean
  securitySmsEnabled?: boolean
  languageCode?: string
}

export async function getNotificationPreferences(): Promise<NotificationPreferenceResponse> {
  const res = await http.get<ApiResponse<NotificationPreferenceResponse>>(
    '/notifications/preferences',
  )
  return res.data.data
}

export async function updateNotificationPreferences(
  req: UpdateNotificationPreferenceRequest,
): Promise<NotificationPreferenceResponse> {
  const res = await http.patch<ApiResponse<NotificationPreferenceResponse>>(
    '/notifications/preferences',
    req,
  )
  return res.data.data
}

export async function readNotification(notificationId: number): Promise<string> {
  const res = await http.patch<ApiResponse<string>>(
    `/notifications/${notificationId}/read`,
    {},
  )
  return res.data.data
}

export async function readAllNotifications(): Promise<Record<string, number>> {
  const res = await http.patch<ApiResponse<Record<string, number>>>(
    '/notifications/me/read-all',
    {},
  )
  return res.data.data
}

