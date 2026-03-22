import React, { createContext, useState, useCallback } from 'react'

export const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { id, message, type }])

    if (duration) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }, duration)
    }

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const value = {
    notifications,
    unreadCount,
    setUnreadCount,
    addNotification,
    removeNotification,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
