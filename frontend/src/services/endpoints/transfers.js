import api from '../api'

const TRANSFER_ENDPOINTS = {
  UPI: '/api/transfers/upi',
  NEFT: '/api/transfers/neft',
  RTGS: '/api/transfers/rtgs',
  IMPS: '/api/transfers/imps',
  INTERNAL: '/api/transfers/internal',
  SELF: '/api/transfers/self',
  SCHEDULED: '/api/transfers/scheduled',
  RECURRING: '/api/transfers/recurring',
  RECENT: '/api/transfers/recent',
  PENDING: '/api/manager/transfers/pending',
  APPROVE: '/api/transfers/:id/approve',
  REJECT: '/api/transfers/:id/reject',
}

export const transferAPI = {
  sendUPI: (data) =>
    api.post(TRANSFER_ENDPOINTS.UPI, data, {
      headers: { 'Idempotency-Key': generateUUID() },
    }),

  sendNEFT: (data) =>
    api.post(TRANSFER_ENDPOINTS.NEFT, data, {
      headers: { 'Idempotency-Key': generateUUID() },
    }),

  sendRTGS: (data) =>
    api.post(TRANSFER_ENDPOINTS.RTGS, data, {
      headers: { 'Idempotency-Key': generateUUID() },
    }),

  sendIMPS: (data) =>
    api.post(TRANSFER_ENDPOINTS.IMPS, data, {
      headers: { 'Idempotency-Key': generateUUID() },
    }),

  sendInternal: (data) =>
    api.post(TRANSFER_ENDPOINTS.INTERNAL, data, {
      headers: { 'Idempotency-Key': generateUUID() },
    }),

  sendSelf: (data) =>
    api.post(TRANSFER_ENDPOINTS.SELF, data, {
      headers: { 'Idempotency-Key': generateUUID() },
    }),

  scheduleTransfer: (data) =>
    api.post(TRANSFER_ENDPOINTS.SCHEDULED, data, {
      headers: { 'Idempotency-Key': generateUUID() },
    }),

  createRecurring: (data) =>
    api.post(TRANSFER_ENDPOINTS.RECURRING, data, {
      headers: { 'Idempotency-Key': generateUUID() },
    }),

  getRecent: () => api.get(TRANSFER_ENDPOINTS.RECENT),

  getPending: () => api.get(TRANSFER_ENDPOINTS.PENDING),

  approve: (id, remarks = '') =>
    api.patch(TRANSFER_ENDPOINTS.APPROVE.replace(':id', id), { remarks }),

  reject: (id, remarks = '') =>
    api.patch(TRANSFER_ENDPOINTS.REJECT.replace(':id', id), { remarks }),
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
