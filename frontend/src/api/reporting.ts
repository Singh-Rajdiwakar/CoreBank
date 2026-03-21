import { http } from './http'
import type { ApiResponse } from './types'

export type SpendingOverviewResponse = {
  totalDebit: string
  totalCredit: string
  byCategory: Record<string, string>
}

export async function getSpendingOverview(
  accountNumber: string,
  params?: { from?: string; to?: string }
): Promise<SpendingOverviewResponse> {
  const res = await http.get<ApiResponse<SpendingOverviewResponse>>(
    `/reports/accounts/spending-overview`,
    {
      params: {
        accountNumber,
        from: params?.from,
        to: params?.to,
      },
    }
  )
  return res.data.data
}

export type MonthlySummaryResponse = Record<string, any>

export async function getMonthlySummary(): Promise<MonthlySummaryResponse> {
  const res = await http.get<ApiResponse<MonthlySummaryResponse>>(
    `/reports/me/monthly-summary`
  )
  return res.data.data
}
