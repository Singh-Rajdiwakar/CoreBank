import { http } from './http'
import type { ApiResponse, PageResponse } from './types'
import type { TransactionResponse } from './transfers'

export type AdminDashboardReport = {
  totalCustomers: number
  totalActiveAccounts: number
  totalDeposits: string
  totalWithdrawals: string
  totalTransfers: string
  fraudFlaggedTransactions: number
  dormantAccounts: number
  closedAccounts: number
}

export async function adminDashboardReport(): Promise<AdminDashboardReport> {
  const res = await http.get<ApiResponse<AdminDashboardReport>>('/admin/reports/dashboard')
  return res.data.data
}

export type BranchStatus = 'ACTIVE' | 'INACTIVE'

export type BranchResponse = {
  id: number
  name: string
  branchCode: string
  ifscCode: string
  city: string
  state: string
  contactEmail: string
  contactPhone: string
  status: BranchStatus
  managerUserId?: number
}

export type CreateBranchRequest = {
  name: string
  branchCode: string
  ifscCode: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  contactEmail: string
  contactPhone: string
  managerUserId?: number
}

export type UpdateBranchRequest = {
  name?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  contactEmail?: string
  contactPhone?: string
  status?: BranchStatus
  managerUserId?: number
}

export async function listBranches(params?: {
  status?: BranchStatus
  page?: number
  size?: number
}): Promise<PageResponse<BranchResponse>> {
  const res = await http.get<ApiResponse<PageResponse<BranchResponse>>>('/admin/branches', {
    params: {
      status: params?.status,
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    },
  })
  return res.data.data
}

export async function createBranch(req: CreateBranchRequest): Promise<BranchResponse> {
  const res = await http.post<ApiResponse<BranchResponse>>('/admin/branches', req)
  return res.data.data
}

export async function getBranch(id: number): Promise<BranchResponse> {
  const res = await http.get<ApiResponse<BranchResponse>>(`/admin/branches/${id}`)
  return res.data.data
}

export async function updateBranch(id: number, req: UpdateBranchRequest): Promise<BranchResponse> {
  const res = await http.put<ApiResponse<BranchResponse>>(`/admin/branches/${id}`, req)
  return res.data.data
}

export type BranchPerformanceResponse = {
  branchId: number
  branchCode: string
  customers: number
  accounts: number
  transferVolume: string
}

export async function branchPerformance(): Promise<BranchPerformanceResponse[]> {
  const res = await http.get<ApiResponse<BranchPerformanceResponse[]>>(
    '/admin/reports/branch-performance',
  )
  return res.data.data
}

export async function dailyVolume(date?: string): Promise<Record<string, unknown>> {
  const res = await http.get<ApiResponse<Record<string, unknown>>>('/admin/reports/daily-volume', {
    params: { date },
  })
  return res.data.data
}

export async function revenueReport(): Promise<Record<string, string>> {
  const res = await http.get<ApiResponse<Record<string, string>>>('/admin/reports/revenue')
  return res.data.data
}

export async function highValueTransactions(params?: {
  threshold?: number
  limit?: number
}): Promise<TransactionResponse[]> {
  const res = await http.get<ApiResponse<TransactionResponse[]>>(
    '/admin/reports/high-value-transactions',
    {
      params: {
        threshold: params?.threshold,
        limit: params?.limit,
      },
    },
  )
  return res.data.data
}

export async function monitoring(): Promise<Record<string, unknown>> {
  const res = await http.get<ApiResponse<Record<string, unknown>>>('/admin/monitoring')
  return res.data.data
}

