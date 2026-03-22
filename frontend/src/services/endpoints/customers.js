import api from '../api'

const CUSTOMER_ENDPOINTS = {
  GET_ME: '/customers/me',
  GET_CUSTOMER: '/customers/:id',
  UPDATE_PROFILE: '/customers/:id',
  GET_DOCUMENTS: '/customers/:id/documents',
  UPLOAD_DOCUMENT: '/customers/:id/documents',
  SET_TRANSACTION_PIN: '/customers/me/transaction-pin',
  GET_ALL: '/customers',
  BLOCK: '/admin/customers/:id/block',
  UNBLOCK: '/admin/customers/:id/unblock',
}

export const customerAPI = {
  getMe: () => api.get(CUSTOMER_ENDPOINTS.GET_ME),

  getCustomer: (id) =>
    api.get(CUSTOMER_ENDPOINTS.GET_CUSTOMER.replace(':id', id)),

  updateProfile: (id, data) =>
    api.put(CUSTOMER_ENDPOINTS.UPDATE_PROFILE.replace(':id', id), data),

  getDocuments: (id) =>
    api.get(CUSTOMER_ENDPOINTS.GET_DOCUMENTS.replace(':id', id)),

  uploadDocument: (id, formData) =>
    api.post(CUSTOMER_ENDPOINTS.UPLOAD_DOCUMENT.replace(':id', id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  setTransactionPin: (pin) =>
    api.post(CUSTOMER_ENDPOINTS.SET_TRANSACTION_PIN, { pin }),

  getAll: (filters = {}) =>
    api.get(CUSTOMER_ENDPOINTS.GET_ALL, { params: filters }),

  block: (id) =>
    api.patch(CUSTOMER_ENDPOINTS.BLOCK.replace(':id', id)),

  unblock: (id) =>
    api.patch(CUSTOMER_ENDPOINTS.UNBLOCK.replace(':id', id)),
}
