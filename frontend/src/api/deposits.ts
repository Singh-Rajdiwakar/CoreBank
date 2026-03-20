import { http } from './http'
import type { ApiResponse } from './types'

export type DepositResponse = {
  id: number
  accountNumber: string
  amount: number
  mode: string
  status: string
  reference: string
  remarks?: string
  createdAt: string
}

export type DepositRequest = {
  accountNumber: string
  amount: number
  mode: 'CASH' | 'CHEQUE' | 'TRANSFER'
  remarks?: string
  chequeNumber?: string
  chequeDate?: string
}

export async function createDeposit(req: DepositRequest): Promise<DepositResponse> {
  const res = await http.post<ApiResponse<DepositResponse>>('/deposits', req)
  return res.data.data
}

export async function clearCheque(reference: string): Promise<DepositResponse> {
  const res = await http.patch<ApiResponse<DepositResponse>>(`/deposits/${reference}/clear`)
  return res.data.data
}
