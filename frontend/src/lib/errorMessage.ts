import axios from 'axios'

import type { ApiErrorResponse } from '../api/types'

export function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiErrorResponse | undefined
    return data?.message ?? data?.error ?? err.message
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

