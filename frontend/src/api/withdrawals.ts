import { http } from './http'
import type { ApiResponse } from './types'

export type WithdrawalResponse = {
  id: number
  accountNumber: string
  amount: number
  mode: string
  status: string
  reference: string
  remarks?: string
  createdAt: string
}

export type WithdrawalRequest = {
  accountNumber: string
  amount: number
  mode: 'CASH' | 'ATM' | 'TRANSFER'
  remarks?: string
  transactionPin?: string
}

export async function createWithdrawal(req: WithdrawalRequest): Promise<WithdrawalResponse> {
  const res = await http.post<ApiResponse<WithdrawalResponse>>('/withdrawals', req)
  return res.data.data
}
