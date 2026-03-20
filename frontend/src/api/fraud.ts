import { http } from './http'
import type { ApiResponse } from './types'

export type FraudStatus =
  | 'CLEAR'
  | 'UNDER_REVIEW'
  | 'SUSPICIOUS'
  | 'BLOCKED'
  | 'ESCALATED'
  | 'RESOLVED'

export type FraudCaseResponse = {
  id: number
  transactionId: number
  score: number
  reason: string
  status: FraudStatus
}

export type FraudReviewRequest = {
  status: FraudStatus
  notes: string
}

export async function listFraudCases(): Promise<FraudCaseResponse[]> {
  const res = await http.get<ApiResponse<FraudCaseResponse[]>>('/fraud/cases')
  return res.data.data
}

export async function reviewFraudCase(
  id: number,
  req: FraudReviewRequest,
): Promise<FraudCaseResponse> {
  const res = await http.patch<ApiResponse<FraudCaseResponse>>(`/fraud/cases/${id}/review`, req)
  return res.data.data
}

