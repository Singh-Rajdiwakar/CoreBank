import { http } from './http'
import type { ApiResponse, PageResponse } from './types'

export type LoanStatus = 'APPLIED' | 'APPROVED' | 'DISBURSED' | 'ACTIVE' | 'CLOSED' | 'REJECTED'
export type LoanType = 'PERSONAL' | 'HOME' | 'EDUCATION' | 'AUTO' | 'BUSINESS'

export type LoanResponse = {
  id: number
  loanId: string
  accountNumber: string
  loanType: LoanType
  status: LoanStatus
  principal: number
  rateOfInterest: number
  tenure: number
  emi: number
  outstanding: number
  nextEmiDate?: string
  disburseDate?: string
  appliedOn: string
  approvedOn?: string
  disbursedOn?: string
}

export type ApplyLoanRequest = {
  accountNumber: string
  loanType: LoanType
  amount: number
  tenure: number
}

export type PayEmiRequest = {
  loanId: number
  amount: number
  transactionPin: string
}

export async function listMyLoans(params?: {
  page?: number
  size?: number
}): Promise<PageResponse<LoanResponse>> {
  const res = await http.get<ApiResponse<PageResponse<LoanResponse>>>('/loans/my', {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    },
  })
  return res.data.data
}

export async function applyLoan(req: ApplyLoanRequest): Promise<LoanResponse> {
  const res = await http.post<ApiResponse<LoanResponse>>('/loans/apply', req)
  return res.data.data
}

export async function getLoanDetails(id: number): Promise<LoanResponse> {
  const res = await http.get<ApiResponse<LoanResponse>>(`/loans/${id}`)
  return res.data.data
}

export async function getLoanStatement(
  id: number,
  params?: { page?: number; size?: number },
): Promise<PageResponse<any>> {
  const res = await http.get<ApiResponse<PageResponse<any>>>(`/loans/${id}/statement`, {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    },
  })
  return res.data.data
}

export async function payEmi(req: PayEmiRequest): Promise<any> {
  const res = await http.post<ApiResponse<any>>(`/loans/${req.loanId}/emi/pay`, req)
  return res.data.data
}

export async function forecloseLoans(id: number): Promise<LoanResponse> {
  const res = await http.post<ApiResponse<LoanResponse>>(`/loans/${id}/foreclose`)
  return res.data.data
}
