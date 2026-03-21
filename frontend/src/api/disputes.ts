import { http } from './http'
import type { ApiResponse, PageResponse } from './types'
import type { AuditLogResponse } from './audit'

export type DisputeCategory =
  | 'UNAUTHORIZED_TRANSACTION'
  | 'FRAUD'
  | 'PROCESSING_ERROR'
  | 'DUPLICATE_DEBIT'
  | 'AMOUNT_MISMATCH'
  | 'CARD_NOT_PRESENT'
  | 'ATM_CASH_NOT_RECEIVED'
  | 'UPI_COLLECT_ISSUE'
  | 'OTHER'

export type DisputePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type DisputeStatus =
  | 'OPEN'
  | 'EVIDENCE_REQUIRED'
  | 'UNDER_REVIEW'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'REJECTED'
  | 'CLOSED'

export type DisputeReportedChannel =
  | 'MOBILE_APP'
  | 'INTERNET_BANKING'
  | 'BRANCH'
  | 'CALL_CENTER'
  | 'EMAIL'

export type DisputeResponse = {
  id: number
  caseNumber: string
  transactionId: number
  transactionReference?: string
  customerId: number
  category: DisputeCategory
  priority: DisputePriority
  status: DisputeStatus
  reportedChannel: DisputeReportedChannel
  disputedAmount?: number
  description: string
  evidenceReference?: string
  reportedAt?: string
  resolutionDueAt?: string
  provisionalCreditDueAt?: string
  provisionalCreditRecommended?: boolean
  assignedTo?: number
  resolutionSummary?: string
  resolvedAt?: string
  closedAt?: string
  createdAt?: string
}

export type DisputeSummaryResponse = {
  openCount: number
  underReviewCount: number
  escalatedCount: number
  resolvedCount: number
  rejectedCount: number
  closedCount: number
}

export async function disputesSummary(): Promise<DisputeSummaryResponse> {
  const res = await http.get<ApiResponse<DisputeSummaryResponse>>('/disputes/ops/summary')
  return res.data.data
}

export async function disputesOpsQueue(params?: {
  status?: DisputeStatus
  overdueOnly?: boolean
  page?: number
  size?: number
}): Promise<PageResponse<DisputeResponse>> {
  const res = await http.get<ApiResponse<PageResponse<DisputeResponse>>>('/disputes/ops', {
    params: {
      status: params?.status,
      overdueOnly: params?.overdueOnly ?? false,
      page: params?.page ?? 0,
      size: params?.size ?? 50,
    },
  })
  return res.data.data
}

export async function disputeTimeline(
  id: number,
  params?: { page?: number; size?: number },
): Promise<PageResponse<AuditLogResponse>> {
  const res = await http.get<ApiResponse<PageResponse<AuditLogResponse>>>(
    `/disputes/${id}/timeline`,
    { params: { page: params?.page ?? 0, size: params?.size ?? 50 } },
  )
  return res.data.data
}

export type DisputeStatusUpdateRequest = {
  status: DisputeStatus
  resolutionSummary?: string
  provisionalCreditRecommended?: boolean
}

export async function updateDisputeStatus(
  id: number,
  req: DisputeStatusUpdateRequest,
): Promise<DisputeResponse> {
  const res = await http.patch<ApiResponse<DisputeResponse>>(`/disputes/${id}/status`, req)
  return res.data.data
}

export type DisputeAssignRequest = {
  assigneeUserId: number
}

export async function assignDispute(id: number, req: DisputeAssignRequest): Promise<DisputeResponse> {
  const res = await http.patch<ApiResponse<DisputeResponse>>(`/disputes/${id}/assign`, req)
  return res.data.data
}

export type DisputeEvidenceRequest = {
  fileName: string
  fileUrl: string
  fileType: string
  checksum?: string
  notes?: string
}

export type DisputeEvidenceResponse = {
  id: number
  disputeId: number
  fileName: string
  fileUrl: string
  fileType: string
  checksum?: string
  notes?: string
  uploadedBy: number
  uploadedAt: string
  createdAt: string
}

export async function getDisputeEvidence(
  id: number,
): Promise<DisputeEvidenceResponse[]> {
  const res = await http.get<ApiResponse<DisputeEvidenceResponse[]>>(
    `/disputes/${id}/evidence`,
  )
  return res.data.data
}

export async function addDisputeEvidence(
  id: number,
  req: DisputeEvidenceRequest,
): Promise<DisputeEvidenceResponse> {
  const res = await http.post<ApiResponse<DisputeEvidenceResponse>>(
    `/disputes/${id}/evidence`,
    req,
  )
  return res.data.data
}

