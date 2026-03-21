import { http } from './http'
import type { ApiResponse, PageResponse } from './types'

export type EmployeeResponse = {
  id: number
  userId: number
  username: string
  branchId: number
  employeeCode: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  manager: boolean
}

export type CreateEmployeeRequest = {
  userId: number
  branchId: number
  employeeCode: string
  manager: boolean
}

export async function listEmployees(
  branchId: number,
  params?: { page?: number; size?: number }
): Promise<PageResponse<EmployeeResponse>> {
  const res = await http.get<ApiResponse<PageResponse<EmployeeResponse>>>(
    `/admin/branches/${branchId}/employees`,
    {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      },
    }
  )
  return res.data.data
}

export async function createEmployee(data: CreateEmployeeRequest): Promise<EmployeeResponse> {
  const res = await http.post<ApiResponse<EmployeeResponse>>('/admin/employees', data)
  return res.data.data
}

export async function updateEmployeeStatus(
  employeeId: number,
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
): Promise<EmployeeResponse> {
  const res = await http.patch<ApiResponse<EmployeeResponse>>(
    `/admin/employees/${employeeId}/status`,
    {},
    {
      params: { status },
    }
  )
  return res.data.data
}
