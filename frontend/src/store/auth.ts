import { jwtDecode } from 'jwt-decode'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role =
  | 'ROLE_CUSTOMER'
  | 'ROLE_EMPLOYEE'
  | 'ROLE_MANAGER'
  | 'ROLE_ADMIN'
  | 'ROLE_AUDITOR'

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  tokenType?: string
  userId?: number
  username?: string
  roles?: Role[]
  passwordExpired?: boolean
}

type JwtClaims = {
  sub?: string
  uid?: number
  roles?: string[]
  exp?: number
}

function decodeClaims(accessToken: string | null): {
  username: string | null
  userId: number | null
  roles: Role[]
} {
  if (!accessToken) return { username: null, userId: null, roles: [] }
  try {
    const claims = jwtDecode<JwtClaims>(accessToken)
    return {
      username: claims.sub ?? null,
      userId: claims.uid ?? null,
      roles: Array.isArray(claims.roles) ? (claims.roles as Role[]) : [],
    }
  } catch {
    return { username: null, userId: null, roles: [] }
  }
}

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  username: string | null
  userId: number | null
  roles: Role[]
  setSession: (auth: AuthResponse) => void
  setTokens: (accessToken: string, refreshToken: string | null) => void
  clear: () => void
  hasRole: (role: Role) => boolean
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      username: null,
      userId: null,
      roles: [],
      setSession: (auth) => {
        const nextAccess = auth.accessToken ?? null
        const nextRefresh = auth.refreshToken ?? null
        const decoded = decodeClaims(nextAccess)
        set({
          accessToken: nextAccess,
          refreshToken: nextRefresh,
          username: auth.username ?? decoded.username,
          userId: auth.userId ?? decoded.userId,
          roles: auth.roles ?? decoded.roles,
        })
      },
      setTokens: (accessToken, refreshToken) => {
        const decoded = decodeClaims(accessToken)
        set({
          accessToken,
          refreshToken,
          username: decoded.username,
          userId: decoded.userId,
          roles: decoded.roles,
        })
      },
      clear: () =>
        set({
          accessToken: null,
          refreshToken: null,
          username: null,
          userId: null,
          roles: [],
        }),
      hasRole: (role) => get().roles.includes(role),
      isAuthenticated: () => Boolean(get().accessToken),
    }),
    {
      name: 'bank-sim-auth',
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        username: s.username,
        userId: s.userId,
        roles: s.roles,
      }),
    },
  ),
)

