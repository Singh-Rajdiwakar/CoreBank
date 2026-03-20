import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { setTransactionPin } from '../../api/customers'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { errorMessage } from '../../lib/errorMessage'

export default function CustomerTransactionPinPage() {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')

  const setM = useMutation({
    mutationFn: async () => {
      if (pin !== confirmPin) {
        throw new Error('PINs do not match')
      }
      if (pin.length !== 4 || !/^\d+$/.test(pin)) {
        throw new Error('PIN must be 4 digits')
      }
      await setTransactionPin({ transactionPin: pin })
    },
    onSuccess: () => {
      toast.success('Transaction PIN set successfully')
      setPin('')
      setConfirmPin('')
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Customer</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Transaction PIN</h1>
          <p className="mt-1 text-sm text-muted">Set or update your 4-digit transaction PIN for secure transfers.</p>
        </div>
        <Badge tone="warning">Security</Badge>
      </header>

      <div className="surface max-w-md space-y-6 p-6">
        <div>
          <label className="block text-sm font-semibold">New PIN (4 digits) *</label>
          <Input
            type="password"
            placeholder="Enter 4-digit PIN"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="mt-2"
          />
          <p className="mt-1 text-xs text-muted">Use numbers only (0-9)</p>
        </div>

        <div>
          <label className="block text-sm font-semibold">Confirm PIN *</label>
          <Input
            type="password"
            placeholder="Confirm PIN"
            maxLength={4}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
            className="mt-2"
          />
        </div>

        {pin && confirmPin && pin !== confirmPin && (
          <p className="text-sm text-red-600">PINs do not match</p>
        )}

        <div className="flex gap-2">
          <Button
            disabled={!pin || !confirmPin || setM.isPending}
            onClick={() => setM.mutate()}
          >
            {setM.isPending ? <Spinner className="h-4 w-4" /> : 'Set PIN'}
          </Button>
        </div>

        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-semibold">Security Tips:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
            <li>Never share your PIN with anyone</li>
            <li>Do not use your birthdate or sequential numbers</li>
            <li>Change your PIN periodically</li>
            <li>PIN is required for all transfers and withdrawals</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
