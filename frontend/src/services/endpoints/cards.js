import api from '../api'

const CARD_ENDPOINTS = {
  GET_MY_CARDS: '/cards',
  REQUEST_CARD: '/cards/request',
  ACTIVATE_CARD: '/cards/:cardNumber/activate',
  BLOCK_CARD: '/cards/:cardNumber/block',
  UNBLOCK_CARD: '/cards/:cardNumber/unblock',
  HOTLIST_CARD: '/cards/:cardNumber/hotlist',
  CHANGE_PIN: '/cards/:cardNumber/change-pin',
  GET_TRANSACTIONS: '/cards/:cardNumber/transactions',
  ATM_WITHDRAW: '/cards/atm-withdraw',
}

export const cardAPI = {
  getMyCards: (accountNumber) =>
    api.get(CARD_ENDPOINTS.GET_MY_CARDS, { params: { accountNumber } }),

  requestCard: (data) =>
    api.post(CARD_ENDPOINTS.REQUEST_CARD, data),

  activateCard: (cardNumber) =>
    api.patch(CARD_ENDPOINTS.ACTIVATE_CARD.replace(':cardNumber', cardNumber), { cardNumber }),

  blockCard: (cardNumber) =>
    api.patch(CARD_ENDPOINTS.BLOCK_CARD.replace(':cardNumber', cardNumber), { cardNumber }),

  unblockCard: (cardNumber) =>
    api.patch(CARD_ENDPOINTS.UNBLOCK_CARD.replace(':cardNumber', cardNumber), { cardNumber }),

  hotlistCard: (cardNumber) =>
    api.patch(CARD_ENDPOINTS.HOTLIST_CARD.replace(':cardNumber', cardNumber), { cardNumber }),

  changePin: (cardNumber, oldPin, newPin) =>
    api.patch(CARD_ENDPOINTS.CHANGE_PIN.replace(':cardNumber', cardNumber), { cardNumber, oldPin, newPin }),

  getTransactions: (cardNumber) =>
    api.get(CARD_ENDPOINTS.GET_TRANSACTIONS.replace(':cardNumber', cardNumber)),

  getCardTransactions: (cardNumber) =>
    api.get(CARD_ENDPOINTS.GET_TRANSACTIONS.replace(':cardNumber', cardNumber)),

  atmWithdraw: (data) =>
    api.post(CARD_ENDPOINTS.ATM_WITHDRAW, data),
}
