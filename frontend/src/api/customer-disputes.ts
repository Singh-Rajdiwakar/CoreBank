import { http } from './http'
import type { ApiResponse, PageResponse } from './types'

export type DisputeStatus = 'OPEN' | 'EVIDENCE_REQUIRED' | 'UNDER_REVIEW' | 'ESCALATED' | 'RESOLVED' | 'REJECTED' | 'CLOSED'

export type DisputeResponse = {
  id: number
  disputeNumber: string
  transactionReference: string
  status: DisputeStatus
  description: string
  amount: number
  reason: string
  createdOn: string
  slaDate?: string
  assignedTo?: string
}

export type CreateDisputeRequest = {
  transactionReference: string
  reason: string
  description: string
  amount: number
}

export type EvidenceRequest = {
  disputeId: number
  type: string
  fileName: string
  fileSize: number
}

export async function listMyDisputes(params?: {
  page?: number
  size?: number
}): Promise<PageResponse<DisputeResponse>> {
  const res = await http.get<ApiResponse<PageResponse<DisputeResponse>>>('/disputes/me', {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    },
  })
  return res.data.data
}

export async function createDispute(req: CreateDisputeRequest): Promise<DisputeResponse> {
  const res = await http.post<ApiResponse<DisputeResponse>>('/disputes', req)
  return res.data.data
}

export async function getDisputeDetails(id: number): Promise<DisputeResponse> {
  const res = await http.get<ApiResponse<DisputeResponse>>(`/disputes/${id}`)
  return res.data.data
}

export async function addDisputeEvidence(id: number, req: EvidenceRequest): Promise<any> {
  const res = await http.post<ApiResponse<any>>(`/disputes/${id}/evidence`, req)
  return res.data.data
}

export async function getDisputeEvidence(
  id: number,
  params?: { page?: number; size?: number },
): Promise<PageResponse<any>> {
  const res = await http.get<ApiResponse<PageResponse<any>>>(`/disputes/${id}/evidence`, {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    },
  })
  return res.data.data
}

export async function getDisputeTimeline(
  id: number,
  params?: { page?: number; size?: number },
): Promise<PageResponse<any>> {
  const res = await http.get<ApiResponse<PageResponse<any>>>(`/disputes/${id}/timeline`, {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    },
  })
  return res.data.data
}
