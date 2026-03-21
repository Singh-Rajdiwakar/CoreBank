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
  const res = await http.get<ApiResponse<PageResponse<LoanResponse>>>('/loans/me', {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    },
  })
  return res.data.data
}

export async function applyForLoan(req: {
  disbursementAccountNumber: string
  loanType: string
  principalAmount: number
  tenureMonths: number
}): Promise<LoanResponse> {
  const res = await http.post<ApiResponse<LoanResponse>>('/loans', req)
  return res.data.data
}

export type EMISchedule = {
  id: number
  installmentNumber: number
  dueDate: string
  principalComponent: number
  interestComponent: number
  penaltyComponent: number
  totalDue: number
  status: 'PENDING' | 'PAID' | 'OVERDUE'
}

export async function getEmiSchedule(loanId: number): Promise<EMISchedule[]> {
  const res = await http.get<ApiResponse<EMISchedule[]>>(`/loans/${loanId}/emi-schedule`)
  return res.data.data
}

export async function payEmi(scheduleId: number, amount: number): Promise<LoanResponse> {
  const res = await http.post<ApiResponse<LoanResponse>>('/loans/emi/pay', {
    scheduleId,
    amount,
  })
  return res.data.data
}

export async function reviewLoan(
  loanId: number,
  data: { approve: boolean; annualInterestRate?: number; remarks?: string }
): Promise<LoanResponse> {
  const res = await http.patch<ApiResponse<LoanResponse>>(`/loans/${loanId}/review`, data)
  return res.data.data
}

export async function disburseLoan(loanId: number): Promise<LoanResponse> {
  const res = await http.patch<ApiResponse<LoanResponse>>(`/loans/${loanId}/disburse`, {})
  return res.data.data
}

export async function forecloseLoan(loanId: number): Promise<LoanResponse> {
  const res = await http.patch<ApiResponse<LoanResponse>>(`/loans/${loanId}/foreclose`, {})
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
