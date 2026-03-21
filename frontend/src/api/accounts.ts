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

export type OpenAccountRequest = {
  primaryCustomerId: number
  secondaryCustomerIds?: number[]
  branchId: number
  accountType: AccountType
  currency?: string
  openingBalance?: number
  minimumBalance?: number
  interestRate?: number
  overdraftLimit?: number
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

export async function openAccount(request: OpenAccountRequest): Promise<AccountResponse> {
  const res = await http.post<ApiResponse<AccountResponse>>('/accounts', request)
  return res.data.data
}

export async function getAccountStatement(
  accountNumber: string,
  params?: { from?: string; to?: string; page?: number; size?: number }
): Promise<PageResponse<TransactionResponse>> {
  const res = await http.get<ApiResponse<PageResponse<TransactionResponse>>>(
    `/accounts/${accountNumber}/statement`,
    {
      params: {
        from: params?.from,
        to: params?.to,
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      },
    }
  )
  return res.data.data
}

export async function getAccountPassbook(
  accountNumber: string,
  params?: { page?: number; size?: number }
): Promise<PageResponse<TransactionResponse>> {
  const res = await http.get<ApiResponse<PageResponse<TransactionResponse>>>(
    `/accounts/${accountNumber}/passbook`,
    {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 50,
      },
    }
  )
  return res.data.data
}

export async function getAccountMiniStatement(accountNumber: string): Promise<TransactionResponse[]> {
  const res = await http.get<ApiResponse<TransactionResponse[]>>(
    `/accounts/${accountNumber}/mini-statement`
  )
  return res.data.data
}

export async function getAccountBalance(accountNumber: string): Promise<Record<string, string>> {
  const res = await http.get<ApiResponse<Record<string, string>>>(
    `/accounts/${accountNumber}/balance`
  )
  return res.data.data
}

export async function approveAccount(
  accountId: number,
  data: { remarks?: string; approved?: boolean }
): Promise<AccountResponse> {
  const res = await http.patch<ApiResponse<AccountResponse>>(
    `/accounts/${accountId}/approve`,
    data,
    {
      params: { approved: data.approved ?? true },
    }
  )
  return res.data.data
}

export async function freezeAccount(
  accountId: number,
  data: { remarks?: string }
): Promise<AccountResponse> {
  const res = await http.patch<ApiResponse<AccountResponse>>(`/accounts/${accountId}/freeze`, data)
  return res.data.data
}

export async function unfreezeAccount(
  accountId: number,
  data: { remarks?: string }
): Promise<AccountResponse> {
  const res = await http.patch<ApiResponse<AccountResponse>>(
    `/accounts/${accountId}/unfreeze`,
    data
  )
  return res.data.data
}

export async function blockAccount(
  accountId: number,
  data: { remarks?: string }
): Promise<AccountResponse> {
  const res = await http.patch<ApiResponse<AccountResponse>>(`/accounts/${accountId}/block`, data)
  return res.data.data
}

export async function unblockAccount(
  accountId: number,
  data: { remarks?: string }
): Promise<AccountResponse> {
  const res = await http.patch<ApiResponse<AccountResponse>>(
    `/accounts/${accountId}/unblock`,
    data
  )
  return res.data.data
}

export async function closeAccount(
  accountId: number,
  data: { remarks?: string }
): Promise<AccountResponse> {
  const res = await http.patch<ApiResponse<AccountResponse>>(`/accounts/${accountId}/close`, data)
  return res.data.data
}

export async function reactivateAccount(
  accountId: number,
  data: { remarks?: string }
): Promise<AccountResponse> {
  const res = await http.patch<ApiResponse<AccountResponse>>(
    `/accounts/${accountId}/reactivate`,
    data
  )
  return res.data.data
}

export type TransactionResponse = {
  id: number
  referenceNumber: string
  sourceAccountNumber: string
  destinationAccountNumber: string
  transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER'
  status: string
  amount: number
  charges: number
  tax: number
  description: string
  initiatedAt: string
  valueDate: string
  fraudScore: number
  approvalRequired: boolean
  failureReason?: string
}

