import { http } from './http'
import type { ApiResponse, PageResponse } from './types'
import type { CustomerResponse } from './customers'
import type { FraudCaseResponse } from './fraud'

export async function assignedCustomers(params?: {
  page?: number
  size?: number
}): Promise<PageResponse<CustomerResponse>> {
  const res = await http.get<ApiResponse<PageResponse<CustomerResponse>>>(
    '/employee/customers/assigned',
    {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      },
    },
  )
  return res.data.data
}

export async function employeeFraudCases(): Promise<FraudCaseResponse[]> {
  const res = await http.get<ApiResponse<FraudCaseResponse[]>>('/employee/fraud/cases')
  return res.data.data
}

