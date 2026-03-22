import api from '../api'

const ACCOUNT_ENDPOINTS = {
  GET_ACCOUNTS: '/accounts',
  GET_ACCOUNT: '/accounts/:accountNumber',
  GET_BALANCE: '/accounts/:accountNumber/balance',
  GET_MINI_STATEMENT: '/accounts/:accountNumber/mini-statement',
  GET_STATEMENT: '/accounts/:accountNumber/statement',
  GET_PASSBOOK: '/accounts/:accountNumber/passbook',
}

export const accountAPI = {
  getAccounts: (customerId) =>
    api.get(`${ACCOUNT_ENDPOINTS.GET_ACCOUNTS}?customerId=${customerId}`),

  getAccount: (accountNumber) =>
    api.get(ACCOUNT_ENDPOINTS.GET_ACCOUNT.replace(':accountNumber', accountNumber)),

  getBalance: (accountNumber) =>
    api.get(ACCOUNT_ENDPOINTS.GET_BALANCE.replace(':accountNumber', accountNumber)),

  getMiniStatement: (accountNumber) =>
    api.get(ACCOUNT_ENDPOINTS.GET_MINI_STATEMENT.replace(':accountNumber', accountNumber)),

  getStatement: (accountNumber, from, to) =>
    api.get(ACCOUNT_ENDPOINTS.GET_STATEMENT.replace(':accountNumber', accountNumber), {
      params: { from, to },
    }),

  getPassbook: (accountNumber) =>
    api.get(ACCOUNT_ENDPOINTS.GET_PASSBOOK.replace(':accountNumber', accountNumber)),
}
