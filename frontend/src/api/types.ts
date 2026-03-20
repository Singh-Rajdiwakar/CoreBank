export type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

export type ApiErrorResponse = {
  timestamp?: unknown
  status?: number
  error?: string
  message?: string
  path?: string
  details?: unknown
}

export type PageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

