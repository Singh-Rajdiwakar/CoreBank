import { zodResolver } from '@hookform/resolvers/zod'
import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { login } from '../../api/auth'
import type { ApiErrorResponse } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { useAuthStore } from '../../store/auth'

const schema = z.object({
  usernameOrEmail: z.string().min(1, 'Enter username or email'),
  password: z.string().min(1, 'Enter password'),
  deviceInfo: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function errorMessage(e: unknown): string {
  const maybe = e as { response?: { data?: ApiErrorResponse } }
  return maybe?.response?.data?.message ?? 'Request failed'
}

export default function LoginPage() {
  const nav = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((s) => s.setSession)
  const roles = useAuthStore((s) => s.roles)

  const defaultDeviceInfo = useMemo(() => {
    const ua = navigator.userAgent
    return ua.length > 64 ? ua.slice(0, 64) : ua
  }, [])

  const {
    register: rf,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { deviceInfo: defaultDeviceInfo },
  })

  async function onSubmit(values: FormValues) {
    try {
      const auth = await login(values)
      setSession(auth)
      toast.success('Logged in')

      const target = (location.state as { from?: string } | null)?.from
      if (target) {
        nav(target, { replace: true })
        return
      }

      const nextRoles = auth.roles ?? roles
      if (nextRoles.includes('ROLE_CUSTOMER')) nav('/app', { replace: true })
      else nav('/ops', { replace: true })
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="absolute inset-0 grid-fade bg-grid opacity-70" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
        <div className="grid w-full gap-8 lg:grid-cols-2">
          <div className="hidden lg:block">
            <div className="surface p-8">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white shadow-soft">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-base font-semibold">BankSim Console</p>
                  <p className="text-xs text-muted">Secure access gateway</p>
                </div>
              </div>

              <div className="mt-7 space-y-2 text-sm text-muted">
                <p>
                  Use seed credentials (admin/manager/employee/auditor/customer) to
                  explore the full backend.
                </p>
                <p>
                  Tip: for transfers you will need a customer profile and transaction
                  PIN.
                </p>
              </div>

              <div className="mt-8 grid gap-2">
                {[
                  { label: 'Admin', u: 'admin', p: 'password' },
                  { label: 'Manager', u: 'manager1', p: 'password' },
                  { label: 'Employee', u: 'employee1', p: 'password' },
                  { label: 'Auditor', u: 'auditor1', p: 'password' },
                  { label: 'Customer', u: 'customer1', p: 'password' },
                ].map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    className="flex items-center justify-between rounded-lg bg-black/5 px-4 py-3 text-left text-sm font-semibold text-ink hover:bg-black/10"
                    onClick={() => {
                      setValue('usernameOrEmail', c.u)
                      setValue('password', c.p)
                    }}
                  >
                    <span>{c.label}</span>
                    <span className="font-mono text-xs text-muted">
                      {c.u} / {c.p}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="surface p-8">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-black/5">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold">Login</h1>
                <p className="text-sm text-muted">JWT + refresh session</p>
              </div>
            </div>

            <form className="mt-7 space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="text-xs font-semibold text-muted">Username / Email</label>
                <div className="mt-2">
                  <Input autoComplete="username" {...rf('usernameOrEmail')} />
                </div>
                {errors.usernameOrEmail && (
                  <p className="mt-1 text-xs text-danger">{errors.usernameOrEmail.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted">Password</label>
                <div className="mt-2">
                  <Input
                    type="password"
                    autoComplete="current-password"
                    {...rf('password')}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
                )}
              </div>

              <input type="hidden" {...rf('deviceInfo')} />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner /> Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>

              <p className="text-center text-sm text-muted">
                New here?{' '}
                <Link to="/register" className="font-semibold text-ink underline">
                  Create an account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

