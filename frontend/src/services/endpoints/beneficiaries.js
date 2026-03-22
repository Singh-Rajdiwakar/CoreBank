import api from '../api'

const BENEFICIARY_ENDPOINTS = {
  GET_BENEFICIARIES: '/beneficiaries',
  CREATE_BENEFICIARY: '/beneficiaries',
  VERIFY_BENEFICIARY: '/beneficiaries/:id/verify',
  DELETE_BENEFICIARY: '/beneficiaries/:id',
}

export const beneficiaryAPI = {
  getAll: () => api.get(BENEFICIARY_ENDPOINTS.GET_BENEFICIARIES),

  create: (data) =>
    api.post(BENEFICIARY_ENDPOINTS.CREATE_BENEFICIARY, data),

  verify: (id) =>
    api.post(BENEFICIARY_ENDPOINTS.VERIFY_BENEFICIARY.replace(':id', id)),

  delete: (id) =>
    api.delete(BENEFICIARY_ENDPOINTS.DELETE_BENEFICIARY.replace(':id', id)),
}
