import { http } from './http'
import type { ApiResponse } from './types'
import type { TransactionResponse } from './transfers'

export async function pendingTransfers(): Promise<TransactionResponse[]> {
  const res = await http.get<ApiResponse<TransactionResponse[]>>('/manager/transfers/pending')
  return res.data.data
}

