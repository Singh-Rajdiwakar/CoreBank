import { http } from './http'
import type { ApiResponse, PageResponse } from './types'
import type { TransactionResponse } from './transfers'

export type CardStatus = 'REQUESTED' | 'ISSUED' | 'ACTIVATED' | 'BLOCKED' | 'HOTLISTED' | 'CLOSED'
export type CardType = 'DEBIT' | 'CREDIT' | 'PREPAID'

export type CardResponse = {
  id: number
  maskedNumber?: string
  cardNumber?: string
  cardType?: CardType
  status: CardStatus
  cardHolderName?: string
  expiryDate: string
  cvv?: string
  last4Digits?: string
  accountNumber?: string
  embossedName?: string
  dailyLimit?: number
  monthlyLimit?: number
  atmWithdrawalLimit?: number
  domesticEnabled?: boolean
  internationalEnabled?: boolean
  contactlessEnabled?: boolean
  isActive?: boolean
  isPinSet?: boolean
  requestedOn?: string
  issuedOn?: string
  activatedOn?: string
}

export type RequestCardRequest = {
  accountNumber: string
}

export type RequestCardRequestOld = {
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

export async function listCardsByAccount(accountNumber: string): Promise<CardResponse[]> {
  const res = await http.get<ApiResponse<CardResponse[]>>('/cards', {
    params: { accountNumber },
  })
  return res.data.data
}

export async function requestCard(accountNumber: string): Promise<CardResponse> {
  const res = await http.post<ApiResponse<CardResponse>>('/cards/request', {}, {
    params: { accountNumber },
  })
  return res.data.data
}

export async function activateCard(cardId: number): Promise<CardResponse> {
  const res = await http.patch<ApiResponse<CardResponse>>(`/cards/activate`, {
    cardNumber: `${cardId}`,
    remarks: '',
  })
  return res.data.data
}

export async function blockCard(cardId: number): Promise<CardResponse> {
  const res = await http.patch<ApiResponse<CardResponse>>(`/cards/block`, {
    cardNumber: `${cardId}`,
    remarks: '',
  })
  return res.data.data
}

export async function unblockCard(cardId: number): Promise<CardResponse> {
  const res = await http.patch<ApiResponse<CardResponse>>(`/cards/unblock`, {
    cardNumber: `${cardId}`,
    remarks: '',
  })
  return res.data.data
}

export async function hotlistCard(cardId: number): Promise<CardResponse> {
  const res = await http.patch<ApiResponse<CardResponse>>(`/cards/hotlist`, {
    cardNumber: `${cardId}`,
    remarks: '',
  })
  return res.data.data
}

export async function setCardPin(req: SetCardPinRequest): Promise<void> {
  await http.patch<ApiResponse<void>>('/cards/pin', {
    cardNumber: req.cardId,
    pin: req.newPin,
  })
}

export async function updateCardSettings(req: UpdateCardSettingsRequest): Promise<CardResponse> {
  const res = await http.patch<ApiResponse<CardResponse>>(`/cards/settings`, {
    domesticEnabled: req.dailyLimit,
    internationalEnabled: req.monthlyLimit,
    contactlessEnabled: req.atmWithdrawalLimit,
  }, {
    params: { cardNumber: `${req.cardId}` },
  })
  return res.data.data
}

export type AtmWithdrawalRequest = {
  cardNumber: string
  pin: string
  amount: number
  remarks?: string
}

export async function atmWithdraw(req: AtmWithdrawalRequest): Promise<TransactionResponse> {
  const res = await http.post<ApiResponse<TransactionResponse>>('/cards/atm-withdraw', {}, {
    params: {
      cardNumber: req.cardNumber,
      pin: req.pin,
      amount: req.amount,
      remarks: req.remarks,
    },
  })
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

export type CardTransactionResponse = {
  id: number
  referenceNumber: string
  sourceAccountNumber?: string
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
}

export async function getCardTransactions(
  cardNumber: string,
  params?: { limit?: number }
): Promise<CardTransactionResponse[]> {
  const res = await http.get<ApiResponse<CardTransactionResponse[]>>(
    `/cards/${cardNumber}/transactions`,
    {
      params: {
        limit: params?.limit ?? 20,
      },
    }
  )
  return res.data.data
}
