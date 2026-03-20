import { http } from './http'
import type { ApiResponse, PageResponse } from './types'

export type BeneficiaryStatus = 'PENDING_VERIFICATION' | 'VERIFIED' | 'DELETED'

export type BeneficiaryResponse = {
  id: number
  customerId: number
  accountNumber: string
  accountHolderName: string
  bankName: string
  ifscCode: string
  status: BeneficiaryStatus
  verifiedOn?: string
  createdOn: string
  coolingPeriodEndsOn?: string
  canTransferNow: boolean
}

export type CreateBeneficiaryRequest = {
  accountNumber: string
  accountHolderName: string
  bankName: string
  ifscCode: string
}

export async function listBeneficiaries(params?: {
  page?: number
  size?: number
}): Promise<PageResponse<BeneficiaryResponse>> {
  const res = await http.get<ApiResponse<PageResponse<BeneficiaryResponse>>>('/beneficiaries', {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    },
  })
  return res.data.data
}

export async function createBeneficiary(req: CreateBeneficiaryRequest): Promise<BeneficiaryResponse> {
  const res = await http.post<ApiResponse<BeneficiaryResponse>>('/beneficiaries', req)
  return res.data.data
}

export async function verifyBeneficiary(id: number): Promise<BeneficiaryResponse> {
  const res = await http.post<ApiResponse<BeneficiaryResponse>>(`/beneficiaries/${id}/verify`)
  return res.data.data
}

export async function deleteBeneficiary(id: number): Promise<void> {
  await http.delete<ApiResponse<void>>(`/beneficiaries/${id}`)
}
