import { http } from './http'
import type { ApiResponse, PageResponse } from './types'

export type KycStatus = 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED'
export type RiskProfile = 'LOW' | 'MEDIUM' | 'HIGH'
export type CustomerStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'BLACKLISTED'
  | 'CLOSED'
  | 'ARCHIVED'

export type AccountStatusFilter =
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'DORMANT'
  | 'FREEZED'
  | 'BLOCKED'
  | 'CLOSED'

export type CustomerResponse = {
  id: number
  customerCode: string
  userId: number
  fullName: string
  email: string
  phone: string
  dob?: string
  branchId: number
  branchCode: string
  kycStatus: KycStatus
  riskProfile: RiskProfile
  status: CustomerStatus
  address?: string
}

export type SetTransactionPinRequest = {
  transactionPin: string
}

export async function getMyProfile(): Promise<CustomerResponse> {
  const res = await http.get<ApiResponse<CustomerResponse>>('/customers/me')
  return res.data.data
}

export async function setTransactionPin(req: SetTransactionPinRequest): Promise<void> {
  await http.post<ApiResponse<void>>('/customers/me/transaction-pin', req)
}

export async function searchCustomers(params?: {
  branchId?: number
  kycStatus?: KycStatus
  status?: CustomerStatus
  riskProfile?: RiskProfile
  accountStatus?: AccountStatusFilter
  page?: number
  size?: number
}): Promise<PageResponse<CustomerResponse>> {
  const res = await http.get<ApiResponse<PageResponse<CustomerResponse>>>('/customers', {
    params: {
      branchId: params?.branchId,
      kycStatus: params?.kycStatus,
      status: params?.status,
      riskProfile: params?.riskProfile,
      accountStatus: params?.accountStatus,
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    },
  })
  return res.data.data
}

export async function blockCustomer(id: number, remark: string): Promise<void> {
  await http.patch<ApiResponse<void>>(`/admin/customers/${id}/block`, { remark })
}

export async function unblockCustomer(id: number, remark: string): Promise<void> {
  await http.patch<ApiResponse<void>>(`/admin/customers/${id}/unblock`, { remark })
}

