import api from '../api'

const DEPOSIT_ENDPOINTS = {
  GET_MY_FDS: '/deposit-products/fd/me',
  GET_MY_RDS: '/deposit-products/rd/me',
  CREATE_FD: '/deposit-products/fd',
  CREATE_RD: '/deposit-products/rd',
  WITHDRAW_FD: '/deposit-products/fd/:fdNumber/premature-withdraw',
  PAY_RD_INSTALLMENT: '/deposit-products/rd/:rdNumber/installment',
}

export const depositAPI = {
  getMyFDs: () => api.get(DEPOSIT_ENDPOINTS.GET_MY_FDS),

  getMyRDs: () => api.get(DEPOSIT_ENDPOINTS.GET_MY_RDS),

  createFD: (data) =>
    api.post(DEPOSIT_ENDPOINTS.CREATE_FD, data),

  createRD: (data) =>
    api.post(DEPOSIT_ENDPOINTS.CREATE_RD, data),

  withdrawFD: (fdNumber, data) =>
    api.patch(
      DEPOSIT_ENDPOINTS.WITHDRAW_FD.replace(':fdNumber', fdNumber),
      data
    ),

  payRDInstallment: (rdNumber, amount) =>
    api.patch(
      DEPOSIT_ENDPOINTS.PAY_RD_INSTALLMENT.replace(':rdNumber', rdNumber),
      { amount }
    ),
}
