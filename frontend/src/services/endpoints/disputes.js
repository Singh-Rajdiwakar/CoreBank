import api from '../api'

const DISPUTE_ENDPOINTS = {
  GET_MY_DISPUTES: '/disputes/me',
  GET_DISPUTE: '/disputes/me/:id',
  CREATE_DISPUTE: '/disputes',
  UPLOAD_EVIDENCE: '/disputes/:id/evidence',
}

export const disputeAPI = {
  getMyDisputes: () => api.get(DISPUTE_ENDPOINTS.GET_MY_DISPUTES),

  getDispute: (id) =>
    api.get(DISPUTE_ENDPOINTS.GET_DISPUTE.replace(':id', id)),

  createDispute: (data) =>
    api.post(DISPUTE_ENDPOINTS.CREATE_DISPUTE, data),

  uploadEvidence: (id, formData) =>
    api.post(DISPUTE_ENDPOINTS.UPLOAD_EVIDENCE.replace(':id', id), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}
