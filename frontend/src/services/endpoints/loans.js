import api from '../api'

const LOAN_ENDPOINTS = {
  GET_MY_LOANS: '/loans/me',
  GET_LOAN: '/loans/:id',
  APPLY_LOAN: '/loans',
  GET_EMI_SCHEDULE: '/loans/:id/emi-schedule',
  PAY_EMI: '/loans/emi/pay',
}

export const loanAPI = {
  getMyLoans: () => api.get(LOAN_ENDPOINTS.GET_MY_LOANS),

  getLoan: (id) =>
    api.get(LOAN_ENDPOINTS.GET_LOAN.replace(':id', id)),

  applyLoan: (data) =>
    api.post(LOAN_ENDPOINTS.APPLY_LOAN, data),

  getEmiSchedule: (id) =>
    api.get(LOAN_ENDPOINTS.GET_EMI_SCHEDULE.replace(':id', id)),

  payEmi: (loanId, amount) =>
    api.post(LOAN_ENDPOINTS.PAY_EMI, { loanId, amount }),
}
