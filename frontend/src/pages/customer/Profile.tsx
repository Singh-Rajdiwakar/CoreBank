import { useQuery } from '@tanstack/react-query'

import { getMyProfile } from '../../api/customers'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'

export default function CustomerProfilePage() {
  const q = useQuery({
    queryKey: ['customers', 'me'],
    queryFn: getMyProfile,
  })

  const profile = q.data

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Customer</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">My Profile</h1>
          <p className="mt-1 text-sm text-muted">View your account information and settings.</p>
        </div>
        <Badge tone="neutral">Profile</Badge>
      </header>

      {q.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Spinner /> Loading profile...
        </div>
      ) : profile ? (
        <div className="surface p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-muted">Full Name</p>
              <p className="mt-1 text-lg font-semibold">{profile.fullName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted">Customer Code</p>
              <p className="mt-1 text-lg font-semibold">{profile.customerCode}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted">Email</p>
              <p className="mt-1 text-sm">{profile.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted">Phone</p>
              <p className="mt-1 text-sm">{profile.phone}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted">KYC Status</p>
              <Badge tone={profile.kycStatus === 'VERIFIED' ? 'success' : 'warning'} className="mt-1">
                {profile.kycStatus}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted">Risk Profile</p>
              <Badge tone={profile.riskProfile === 'LOW' ? 'success' : profile.riskProfile === 'MEDIUM' ? 'warning' : 'danger'} className="mt-1">
                {profile.riskProfile}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted">Account Status</p>
              <Badge tone={profile.status === 'ACTIVE' ? 'success' : 'warning'} className="mt-1">
                {profile.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted">Address</p>
              <p className="mt-1 text-sm">{profile.address || 'Not provided'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="surface p-6 text-center text-sm text-muted">
          Failed to load profile
        </div>
      )}
    </div>
  )
}
