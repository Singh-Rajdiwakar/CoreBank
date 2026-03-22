import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, roles } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && !roles.includes(requiredRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
