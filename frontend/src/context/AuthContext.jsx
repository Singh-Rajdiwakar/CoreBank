import React, { createContext, useState, useCallback } from 'react'
import { authAPI } from '../services/endpoints/auth'
import { toast } from 'sonner'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('accessToken'))
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (usernameOrEmail, password) => {
    setLoading(true)
    try {
      const response = await authAPI.login(usernameOrEmail, password)
      // Backend returns ApiResponse wrapper with data inside
      const { accessToken, refreshToken, userId, username, roles } = response.data.data

      // Construct user object from response fields
      const userData = {
        id: userId,
        username,
        roles
      }

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(userData))

      setToken(accessToken)
      setUser(userData)

      toast.success('Login successful!')
      return userData
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
    toast.success('Logged out successfully')
  }, [])

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
    roles: user?.roles || [],
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
