import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const call = useCallback(async (apiFunc, ...args) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiFunc(...args)
      return response.data
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'An error occurred'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, call }
}
