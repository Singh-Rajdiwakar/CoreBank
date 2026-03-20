import { http } from './http'
import type { ApiResponse, PageResponse } from './types'

export type AuditLogResponse = {
  id: number
  actorUserId?: number
  actionType: string
  targetEntity: string
  targetId?: string
  oldValue?: string
  newValue?: string
  success: boolean
  remarks?: string
  ipAddress?: string
  deviceInfo?: string
  actionAt: string
}

export async function listAuditLogs(params?: {
  from?: string
  to?: string
  page?: number
  size?: number
}): Promise<PageResponse<AuditLogResponse>> {
  const res = await http.get<ApiResponse<PageResponse<AuditLogResponse>>>('/audit/logs', {
    params: {
      from: params?.from,
      to: params?.to,
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    },
  })
  return res.data.data
}

