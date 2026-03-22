import api from '../api'

const NOTIFICATION_ENDPOINTS = {
  GET_UNREAD_COUNT: '/notifications/unread-count',
  GET_MY_NOTIFICATIONS: '/notifications/me',
  MARK_READ: '/notifications/:id/read',
  MARK_ALL_READ: '/notifications/me/read-all',
  GET_PREFERENCES: '/notifications/preferences',
  UPDATE_PREFERENCES: '/notifications/preferences',
}

export const notificationAPI = {
  getUnreadCount: () => api.get(NOTIFICATION_ENDPOINTS.GET_UNREAD_COUNT),

  getMyNotifications: () => api.get(NOTIFICATION_ENDPOINTS.GET_MY_NOTIFICATIONS),

  markRead: (id) =>
    api.patch(NOTIFICATION_ENDPOINTS.MARK_READ.replace(':id', id)),

  markAllRead: () =>
    api.patch(NOTIFICATION_ENDPOINTS.MARK_ALL_READ),

  getPreferences: () =>
    api.get(NOTIFICATION_ENDPOINTS.GET_PREFERENCES),

  updatePreferences: (data) =>
    api.patch(NOTIFICATION_ENDPOINTS.UPDATE_PREFERENCES, data),
}
