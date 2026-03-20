import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { register as registerApi } from '../../api/auth'
import type { ApiErrorResponse } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { useAuthStore } from '../../store/auth'

const schema = z.object({
  username: z.string().min(4, 'Min 4 chars').max(30, 'Max 30 chars'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^[0-9]{10,15}$/, 'Phone must be 10-15 digits'),
  password: z
    .string()
    .min(8, 'Min 8 chars')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, 'Weak password'),
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
})

type FormValues = z.infer<typeof schema>

function errorMessage(e: unknown): string {
  const maybe = e as { response?: { data?: ApiErrorResponse } }
  if (Array.isArray(maybe?.response?.data?.details)) {
    return String(
      maybe.response?.data?.details?.[0] ?? maybe.response?.data?.message ?? 'Request failed',
    )
  }
  return maybe?.response?.data?.message ?? 'Request failed'
}

export default function RegisterPage() {
  const nav = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)

  const {
    register: rf,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    try {
      const auth = await registerApi(values)
      setSession(auth)
      toast.success('Account created')
      nav('/app', { replace: true })
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="absolute inset-0 grid-fade bg-grid opacity-70" />
      <div className="relative mx-auto flex min-h-screen max-w-xl items-center px-6 py-16">
        <div className="surface w-full p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-black/5">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold">Create account</h1>
              <p className="text-sm text-muted">Customer role by default</p>
            </div>
          </div>

          <form className="mt-7 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-muted">First name</label>
                <div className="mt-2">
                  <Input {...rf('firstName')} />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-xs text-danger">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-muted">Last name</label>
                <div className="mt-2">
                  <Input {...rf('lastName')} />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-xs text-danger">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted">Username</label>
              <div className="mt-2">
                <Input autoComplete="username" {...rf('username')} />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-danger">{errors.username.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-muted">Email</label>
                <div className="mt-2">
                  <Input type="email" autoComplete="email" {...rf('email')} />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-muted">Phone</label>
                <div className="mt-2">
                  <Input inputMode="numeric" autoComplete="tel" {...rf('phone')} />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-xs text-danger">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted">Password</label>
              <div className="mt-2">
                <Input type="password" autoComplete="new-password" {...rf('password')} />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
              )}
              <p className="mt-2 text-xs text-muted">
                Must include upper, lower, number and special character.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner /> Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>

            <p className="text-center text-sm text-muted">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-ink underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

