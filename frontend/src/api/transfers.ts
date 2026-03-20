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

export async function rejectTransfer(id: number, remark: string): Promise<TransactionResponse> {
  const res = await http.patch<ApiResponse<TransactionResponse>>(`/transfers/${id}/reject`, {
    remark,
  } satisfies RemarkRequest)
  return res.data.data
}

export async function cancelTransfer(id: number): Promise<TransactionResponse> {
  const res = await http.patch<ApiResponse<TransactionResponse>>(`/transfers/${id}/cancel`)
  return res.data.data
}

export async function transferReceipt(id: number): Promise<TransactionResponse> {
  const res = await http.get<ApiResponse<TransactionResponse>>(`/transfers/${id}/receipt`)
  return res.data.data
}

export async function reverseTransfer(
  reference: string,
  remark: string,
): Promise<TransactionResponse> {
  const res = await http.patch<ApiResponse<TransactionResponse>>(`/transfers/${reference}/reverse`, {
    remark,
  } satisfies RemarkRequest)
  return res.data.data
}
