import { http } from './http'
import type { ApiResponse, PageResponse } from './types'

export type FdStatus = 'ACTIVE' | 'MATURED' | 'CLOSED' | 'PREMATURELY_WITHDRAWN'
export type RdStatus = 'ACTIVE' | 'MATURED' | 'CLOSED' | 'DEFAULTED'

export type FdResponse = {
  id: number
  fdNumber: string
  accountNumber: string
  principal: number
  rateOfInterest: number
  tenure: number
  maturityDate: string
  maturityAmount: number
  status: FdStatus
  createdOn: string
}

export type RdResponse = {
  id: number
  rdNumber: string
  accountNumber: string
  installmentAmount: number
  rateOfInterest: number
  tenure: number
  maturityDate: string
  totalAmount: number
  status: RdStatus
  nextInstallmentDate?: string
  createdOn: string
}

export type CreateFdRequest = {
  accountNumber: string
  principal: number
  tenure: number
}

export type CreateRdRequest = {
  accountNumber: string
  installmentAmount: number
  tenure: number
}

export async function listMyFds(params?: {
  page?: number
  size?: number
}): Promise<PageResponse<FdResponse>> {
  const res = await http.get<ApiResponse<PageResponse<FdResponse>>>('/deposit-products/fd/my', {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    },
  })
  return res.data.data
}

export async function createFd(req: CreateFdRequest): Promise<FdResponse> {
  const res = await http.post<ApiResponse<FdResponse>>('/deposit-products/fd', req)
  return res.data.data
}

export async function withdrawFdPrematurely(id: number): Promise<FdResponse> {
  const res = await http.post<ApiResponse<FdResponse>>(`/deposit-products/fd/${id}/premature-withdraw`)
  return res.data.data
}

export async function listMyRds(params?: {
  page?: number
  size?: number
}): Promise<PageResponse<RdResponse>> {
  const res = await http.get<ApiResponse<PageResponse<RdResponse>>>('/deposit-products/rd/my', {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    },
  })
  return res.data.data
}

export async function createRd(req: CreateRdRequest): Promise<RdResponse> {
  const res = await http.post<ApiResponse<RdResponse>>('/deposit-products/rd', req)
  return res.data.data
}

export async function payRdInstallment(id: number, amount: number): Promise<RdResponse> {
  const res = await http.post<ApiResponse<RdResponse>>(`/deposit-products/rd/${id}/pay-installment`, {
    amount,
  })
  return res.data.data
}
