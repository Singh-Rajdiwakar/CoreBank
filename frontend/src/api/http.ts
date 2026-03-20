import axios, { AxiosError } from 'axios'

import type { AuthResponse } from '../store/auth'
import { useAuthStore } from '../store/auth'
import type { ApiResponse } from './types'

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:8080/api'

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000,
})

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let refreshWaiters: Array<(token: string | null) => void> = []

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setSession, clear } = useAuthStore.getState()
  if (!refreshToken) return null

  try {
    const res = await axios.post<ApiResponse<AuthResponse>>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { timeout: 20_000 },
    )
    const auth = res.data?.data
    if (!auth?.accessToken) return null
    setSession(auth)
    return auth.accessToken
  } catch {
    clear()
    return null
  }
}

function waitForRefresh(): Promise<string | null> {
  return new Promise((resolve) => refreshWaiters.push(resolve))
}

function flushRefreshWaiters(token: string | null) {
  const waiters = refreshWaiters
  refreshWaiters = []
  waiters.forEach((w) => w(token))
}

http.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const status = err.response?.status
    const original = err.config as (typeof err.config & { _retry?: boolean }) | undefined

    if (!original || status !== 401 || original._retry) throw err

    const url = String(original.url ?? '')
    if (url.includes('/auth/login') || url.includes('/auth/refresh')) throw err

    original._retry = true

    if (isRefreshing) {
      const token = await waitForRefresh()
      if (!token) throw err
      original.headers = original.headers ?? {}
      original.headers.Authorization = `Bearer ${token}`
      return http.request(original)
    }

    isRefreshing = true
    try {
      const token = await refreshAccessToken()
      flushRefreshWaiters(token)
      if (!token) throw err
      original.headers = original.headers ?? {}
      original.headers.Authorization = `Bearer ${token}`
      return http.request(original)
    } finally {
      isRefreshing = false
    }
  },
)

