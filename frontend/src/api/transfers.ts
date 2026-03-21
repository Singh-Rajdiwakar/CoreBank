import { http } from './http'
import type { ApiResponse } from './types'

export type TransactionResponse = {
  id: number
  referenceNumber: string
  sourceAccountNumber: string
  destinationAccountNumber?: string
  transactionType: string
  status: string
  amount: number
  charges?: number
  tax?: number
  description?: string
  initiatedAt: string
  valueDate?: string
  fraudScore?: number
  approvalRequired?: boolean
  failureReason?: string
}

export type SelfTransferRequest = {
  sourceAccountNumber: string
  destinationAccountNumber: string
  amount: number
  transferMode: 'SELF'
  remarks: string
  transactionPin: string
}

export type InternalTransferRequest = {
  sourceAccountNumber: string
  destinationAccountNumber: string
  amount: number
  transferMode: 'INTERNAL'
  remarks: string
  transactionPin: string
}

export type BeneficiaryTransferRequest = {
  sourceAccountNumber: string
  beneficiaryId: number
  amount: number
  transferMode: string
  remarks: string
  transactionPin: string
}

export type ExternalTransferRequest = {
  sourceAccountNumber: string
  destinationAccountNumber: string
  amount: number
  transferMode: 'NEFT' | 'IMPS' | 'RTGS' | 'UPI'
  remarks: string
  transactionPin: string
  beneficiaryName?: string
}

export async function recentTransfers(): Promise<TransactionResponse[]> {
  const res = await http.get<ApiResponse<TransactionResponse[]>>('/transfers/recent')
  return res.data.data
}

type RemarkRequest = { remark: string }

export async function selfTransfer(req: SelfTransferRequest, idempotencyKey: string): Promise<TransactionResponse> {
  const res = await http.post<ApiResponse<TransactionResponse>>('/transfers/self', req, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return res.data.data
}

export async function internalTransfer(req: InternalTransferRequest, idempotencyKey: string): Promise<TransactionResponse> {
  const res = await http.post<ApiResponse<TransactionResponse>>('/transfers/internal', req, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return res.data.data
}

export async function beneficiaryTransfer(req: BeneficiaryTransferRequest, idempotencyKey: string): Promise<TransactionResponse> {
  const res = await http.post<ApiResponse<TransactionResponse>>('/transfers/beneficiary', req, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return res.data.data
}

export async function externalTransfer(req: ExternalTransferRequest, idempotencyKey: string): Promise<TransactionResponse> {
  const res = await http.post<ApiResponse<TransactionResponse>>(`/transfers/${req.transferMode.toLowerCase()}`, req, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return res.data.data
}

export async function approveTransfer(id: number, remark: string): Promise<TransactionResponse> {
  const res = await http.patch<ApiResponse<TransactionResponse>>(`/transfers/${id}/approve`, {
    remark,
  } satisfies RemarkRequest)
  return res.data.data
}

export async function rejectTransfer(id: number, remarks: string): Promise<TransactionResponse> {
  const res = await http.patch<ApiResponse<TransactionResponse>>(`/transfers/${id}/reject`, {
    remarks,
  })
  return res.data.data
}

export async function cancelTransfer(id: number): Promise<TransactionResponse> {
  const res = await http.patch<ApiResponse<TransactionResponse>>(`/transfers/${id}/cancel`, {})
  return res.data.data
}

export async function reverseTransfer(reference: string, remarks: string): Promise<TransactionResponse> {
  const res = await http.patch<ApiResponse<TransactionResponse>>(`/transfers/${reference}/reverse`, {
    remarks,
  })
  return res.data.data
}

export async function getTransferReceipt(id: number): Promise<TransactionResponse> {
  const res = await http.get<ApiResponse<TransactionResponse>>(`/transfers/${id}/receipt`)
  return res.data.data
}

export type ScheduledTransferRequest = SelfTransferRequest & {
  scheduledFor: string
}

export async function scheduleTransfer(
  req: ScheduledTransferRequest,
  idempotencyKey: string
): Promise<TransactionResponse> {
  const res = await http.post<ApiResponse<TransactionResponse>>('/transfers/scheduled', req, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return res.data.data
}

export type RecurringTransferRequest = {
  sourceAccountNumber: string
  destinationAccountNumber: string
  beneficiaryId?: number
  amount: number
  transferMode: string
  startAt: string
  occurrences: number
  frequencyDays: number
  remarks: string
  transactionPin: string
  otp?: string
}

export async function recurringTransfer(
  req: RecurringTransferRequest,
  idempotencyKey: string
): Promise<TransactionResponse[]> {
  const res = await http.post<ApiResponse<TransactionResponse[]>>('/transfers/recurring', req, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return res.data.data
}

export type BulkTransferItem = {
  destinationAccountNumber: string
  amount: number
  remarks: string
}

export type BulkTransferRequest = {
  sourceAccountNumber: string
  items: BulkTransferItem[]
  transactionPin: string
  otp?: string
  remarks?: string
}

export type BulkTransferResponse = {
  batchReference: string
  requestedCount: number
  successCount: number
  failedCount: number
  totalRequestedAmount: number
  totalSuccessfulAmount: number
  items: {
    itemIndex: number
    destinationAccountNumber: string
    amount: number
    status: string
    transactionId?: number
    referenceNumber?: string
    errorMessage?: string
  }[]
}

export async function bulkTransfer(
  req: BulkTransferRequest,
  idempotencyKey: string
): Promise<BulkTransferResponse> {
  const res = await http.post<ApiResponse<BulkTransferResponse>>('/transfers/bulk-file', req, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return res.data.data
}

export async function bulkSalaryTransfer(
  req: BulkTransferRequest,
  idempotencyKey: string
): Promise<BulkTransferResponse> {
  const res = await http.post<ApiResponse<BulkTransferResponse>>('/transfers/bulk-salary', req, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return res.data.data
}
