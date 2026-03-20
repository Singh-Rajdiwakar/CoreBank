import { http } from './http'
import type { ApiResponse, PageResponse } from './types'

export type CardStatus = 'REQUESTED' | 'ISSUED' | 'ACTIVATED' | 'BLOCKED' | 'HOTLISTED' | 'CLOSED'
export type CardType = 'DEBIT' | 'CREDIT' | 'PREPAID'

export type CardResponse = {
  id: number
  cardNumber: string
  cardType: CardType
  status: CardStatus
  expiryDate: string
  cvv: string
  last4Digits: string
  accountNumber: string
  embossedName: string
  dailyLimit: number
  monthlyLimit: number
  atmWithdrawalLimit: number
  isActive: boolean
  isPinSet: boolean
  requestedOn: string
  issuedOn?: string
  activatedOn?: string
}

export type RequestCardRequest = {
  accountNumber: string
  cardType: CardType
}

export type SetCardPinRequest = {
  cardId: number
  newPin: string
}

export type UpdateCardSettingsRequest = {
  cardId: number
  dailyLimit?: number
  monthlyLimit?: number
  atmWithdrawalLimit?: number
  isActive?: boolean
}

export async function listMyCards(params?: {
  page?: number
  size?: number
}): Promise<PageResponse<CardResponse>> {
  const res = await http.get<ApiResponse<PageResponse<CardResponse>>>('/cards', {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    },
  })
  return res.data.data
}

export async function requestCard(req: RequestCardRequest): Promise<CardResponse> {
  const res = await http.post<ApiResponse<CardResponse>>('/cards', req)
  return res.data.data
}

export async function activateCard(cardId: number): Promise<CardResponse> {
  const res = await http.patch<ApiResponse<CardResponse>>(`/cards/${cardId}/activate`)
  return res.data.data
}

export async function blockCard(cardId: number): Promise<CardResponse> {
  const res = await http.patch<ApiResponse<CardResponse>>(`/cards/${cardId}/block`)
  return res.data.data
}

export async function unblockCard(cardId: number): Promise<CardResponse> {
  const res = await http.patch<ApiResponse<CardResponse>>(`/cards/${cardId}/unblock`)
  return res.data.data
}

export async function hotlistCard(cardId: number): Promise<CardResponse> {
  const res = await http.patch<ApiResponse<CardResponse>>(`/cards/${cardId}/hotlist`)
  return res.data.data
}

export async function setCardPin(req: SetCardPinRequest): Promise<void> {
  await http.post<ApiResponse<void>>('/cards/pin/set', req)
}

export async function updateCardSettings(req: UpdateCardSettingsRequest): Promise<CardResponse> {
  const res = await http.patch<ApiResponse<CardResponse>>(`/cards/${req.cardId}/settings`, req)
  return res.data.data
}

export async function cardTransactionHistory(
  cardId: number,
  params?: { page?: number; size?: number },
): Promise<PageResponse<any>> {
  const res = await http.get<ApiResponse<PageResponse<any>>>(`/cards/${cardId}/transactions`, {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    },
  })
  return res.data.data
}
