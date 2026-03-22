import api from '../api'

const AUDIT_ENDPOINTS = {
  GET_AUDIT_LOGS: '/audit/logs',
}

export const auditAPI = {
  getLogs: (filters = {}) =>
    api.get(AUDIT_ENDPOINTS.GET_AUDIT_LOGS, { params: filters }),
}
