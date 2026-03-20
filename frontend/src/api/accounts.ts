import { http } from './http'
import type { ApiResponse, PageResponse } from './types'

export type AccountType =
  | 'SAVINGS'
  | 'CURRENT'
  | 'SALARY'
  | 'FIXED_DEPOSIT'
  | 'RECURRING_DEPOSIT'
  | 'LOAN'
  | 'WALLET'

export type AccountStatus =
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'DORMANT'
  | 'FREEZED'
  | 'BLOCKED'
  | 'CLOSED'

export type AccountResponse = {
  id: number
  accountNumber: string
  accountType: AccountType
  status: AccountStatus
  currency: string
  balance: number
  availableBalance: number
  holdAmount: number
  minimumBalance: number
  overdraftLimit: number
  openedOn: string
  branchId: number
}

export async function listMyAccounts(params?: {
  page?: number
  size?: number
}): Promise<PageResponse<AccountResponse>> {
  const res = await http.get<ApiResponse<PageResponse<AccountResponse>>>('/accounts', {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    },
  })
  return res.data.data
}

