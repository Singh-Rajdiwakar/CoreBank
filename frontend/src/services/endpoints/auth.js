import api from '../api'

const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  CHANGE_PASSWORD: '/auth/change-password',
}

export const authAPI = {
  register: (registerData) =>
    api.post(AUTH_ENDPOINTS.REGISTER, registerData),

  login: (usernameOrEmail, password, deviceInfo = 'WEB') =>
    api.post(AUTH_ENDPOINTS.LOGIN, { usernameOrEmail, password, deviceInfo }),

  refresh: (refreshToken) =>
    api.post(AUTH_ENDPOINTS.REFRESH, { refreshToken }),

  logout: () => api.post(AUTH_ENDPOINTS.LOGOUT),

  changePassword: (oldPassword, newPassword) =>
    api.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, { oldPassword, newPassword }),
}
