import type { AuthResponse } from '../store/auth'
import { http } from './http'
import type { ApiResponse } from './types'

export type LoginRequest = {
  usernameOrEmail: string
  password: string
  deviceInfo?: string
}

export type RegisterRequest = {
  username: string
  email: string
  phone: string
  password: string
  firstName: string
  lastName: string
}

export async function login(req: LoginRequest): Promise<AuthResponse> {
  const res = await http.post<ApiResponse<AuthResponse>>('/auth/login', req)
  return res.data.data
}

export async function register(req: RegisterRequest): Promise<AuthResponse> {
  const res = await http.post<ApiResponse<AuthResponse>>('/auth/register', req)
  return res.data.data
}

export async function logout(refreshToken: string): Promise<void> {
  await http.post('/auth/logout', { refreshToken })
}

