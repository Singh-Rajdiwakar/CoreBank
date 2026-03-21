import { http } from './http'
import type { ApiResponse } from './types'

export type SystemConfig = {
  createdAt: string
  updatedAt: string
  version: number
  id: number
  configKey: string
  configValue: string
  description: string
}

export type InterestConfig = {
  createdAt: string
  updatedAt: string
  version: number
  id: number
  productType: string
  annualRate: number
  active: boolean
}

export type FeeConfig = {
  createdAt: string
  updatedAt: string
  version: number
  id: number
  code: string
  description: string
  amount: number
  percentage: number
  active: boolean
}

export async function getSystemConfig(): Promise<Record<string, string>> {
  const res = await http.get<ApiResponse<Record<string, string>>>('/admin/config/system')
  return res.data.data
}

export async function setSystemConfig(data: {
  key: string
  value: string
  description?: string
}): Promise<SystemConfig> {
  const res = await http.post<ApiResponse<SystemConfig>>('/admin/config/system', data)
  return res.data.data
}

export async function getInterestConfigs(): Promise<InterestConfig[]> {
  const res = await http.get<ApiResponse<InterestConfig[]>>('/admin/config/interests')
  return res.data.data
}

export async function createInterestConfig(data: {
  productType: string
  annualRate: number
  active: boolean
}): Promise<InterestConfig> {
  const res = await http.post<ApiResponse<InterestConfig>>('/admin/config/interests', data)
  return res.data.data
}

export async function getFeeConfigs(): Promise<FeeConfig[]> {
  const res = await http.get<ApiResponse<FeeConfig[]>>('/admin/config/fees')
  return res.data.data
}

export async function createFeeConfig(data: {
  code: string
  description: string
  amount: number
  percentage: number
  active: boolean
}): Promise<FeeConfig> {
  const res = await http.post<ApiResponse<FeeConfig>>('/admin/config/fees', data)
  return res.data.data
}
