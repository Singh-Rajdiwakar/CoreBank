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

export type DocumentType =
  | 'PAN'
  | 'AADHAAR'
  | 'PASSPORT'
  | 'DRIVING_LICENSE'
  | 'VOTER_ID'
  | 'UTILITY_BILL'
  | 'BANK_STATEMENT'

export type CustomerDocument = {
  createdAt: string
  updatedAt: string
  version: number
  id: number
  documentType: DocumentType
  documentNumber: string
  fileName: string
  fileUrl: string
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
}

export async function getCustomerDocuments(customerId: number): Promise<CustomerDocument[]> {
  const res = await http.get<ApiResponse<CustomerDocument[]>>(`/customers/${customerId}/documents`)
  return res.data.data
}

export async function uploadCustomerDocument(
  customerId: number,
  data: {
    documentType: DocumentType
    documentNumber: string
    fileName: string
    fileUrl: string
  }
): Promise<string> {
  const res = await http.post<ApiResponse<string>>(`/customers/${customerId}/documents`, data)
  return res.data.data
}

export async function archiveCustomer(customerId: number): Promise<string> {
  const res = await http.patch<ApiResponse<string>>(`/customers/${customerId}/archive`)
  return res.data.data
}

export async function getCustomerById(customerId: number): Promise<CustomerResponse> {
  const res = await http.get<ApiResponse<CustomerResponse>>(`/customers/${customerId}`)
  return res.data.data
}

export type CreateCustomerRequest = {
  username: string
  password: string
  email: string
  phone: string
  firstName: string
  lastName: string
  dob?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  branchId: number
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  pan?: string
  aadhaar?: string
  passport?: string
  nomineeName?: string
  nomineeRelationship?: string
  nomineeContact?: string
  employmentType?: string
  employerName?: string
  incomeRange?: string
  riskProfile?: RiskProfile
}

export type UpdateCustomerRequest = {
  firstName?: string
  lastName?: string
  dob?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  nomineeName?: string
  nomineeRelationship?: string
  nomineeContact?: string
  employmentType?: string
  employerName?: string
  incomeRange?: string
  riskProfile?: RiskProfile
  kycStatus?: KycStatus
  status?: CustomerStatus
}

export async function createCustomer(req: CreateCustomerRequest): Promise<CustomerResponse> {
  const res = await http.post<ApiResponse<CustomerResponse>>('/customers', req)
  return res.data.data
}

export async function updateCustomer(customerId: number, req: UpdateCustomerRequest): Promise<CustomerResponse> {
  const res = await http.put<ApiResponse<CustomerResponse>>(`/customers/${customerId}`, req)
  return res.data.data
}

