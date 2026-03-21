import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { listMyAccounts } from '../../api/accounts'
import { listMyCards, requestCard, blockCard, unblockCard, hotlistCard, setCardPin } from '../../api/cards'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { errorMessage } from '../../lib/errorMessage'

export default function CustomerCardsPage() {
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [accountNumber, setAccountNumber] = useState('')
  const [showPinForm, setShowPinForm] = useState<number | null>(null)
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')

  const cardsQ = useQuery({
    queryKey: ['cards', { page: 0, size: 50 }],
    queryFn: () => listMyCards({ page: 0, size: 50 }),
  })

  const accountsQ = useQuery({
    queryKey: ['accounts', { page: 0, size: 50 }],
    queryFn: () => listMyAccounts({ page: 0, size: 50 }),
  })

  const requestM = useMutation({
    mutationFn: async () => {
      return requestCard(accountNumber)
    },
    onSuccess: () => {
      toast.success('Card request submitted')
      setAccountNumber('')
      setShowRequestForm(false)
      void cardsQ.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const blockM = useMutation({
    mutationFn: (id: number) => blockCard(id),
    onSuccess: () => {
      toast.success('Card blocked')
      void cardsQ.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const unblockM = useMutation({
    mutationFn: (id: number) => unblockCard(id),
    onSuccess: () => {
      toast.success('Card unblocked')
      void cardsQ.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const hotlistM = useMutation({
    mutationFn: (id: number) => hotlistCard(id),
    onSuccess: () => {
      toast.success('Card hotlisted')
      void cardsQ.refetch()
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const setPinM = useMutation({
    mutationFn: async () => {
      if (newPin !== confirmPin) {
        throw new Error('PINs do not match')
      }
      if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
        throw new Error('PIN must be 4 digits')
      }
      return setCardPin({ cardId: showPinForm!, newPin })
    },
    onSuccess: () => {
      toast.success('Card PIN set')
      setNewPin('')
      setConfirmPin('')
      setShowPinForm(null)
    },
    onError: (e) => toast.error(errorMessage(e)),
  })

  const cards = cardsQ.data?.content ?? []
  const accounts = accountsQ.data?.content ?? []

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="chip">Customer</p>
          <h1 className="mt-3 font-display text-2xl font-semibold">Cards</h1>
          <p className="mt-1 text-sm text-muted">Request, manage, and control your cards.</p>
        </div>
        <Badge tone="neutral">{cards.length} cards</Badge>
      </header>

      {!showRequestForm ? (
        <div className="surface p-6">
          <button
            type="button"
            className="rounded-lg bg-black/5 px-4 py-2 text-sm font-semibold hover:bg-black/10"
            onClick={() => setShowRequestForm(true)}
          >
            Request Card
          </button>
        </div>
      ) : (
        <div className="surface space-y-4 p-6">
          <div>
            <label className="text-sm font-semibold">Account *</label>
            <select
              id="account-select"
              className="mt-1 w-full rounded border border-black/10 px-3 py-2 text-sm"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              aria-label="Select Account"
            >
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.accountNumber} value={a.accountNumber}>
                  {a.accountNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              disabled={!accountNumber || requestM.isPending}
              onClick={() => requestM.mutate()}
            >
              {requestM.isPending ? <Spinner className="h-4 w-4" /> : 'Request Card'}
            </Button>
            <button
              type="button"
              className="rounded-lg border border-black/10 px-4 py-2 text-sm font-semibold hover:bg-black/5"
              onClick={() => setShowRequestForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="surface p-6">
        {cardsQ.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Spinner /> Loading cards...
          </div>
        ) : cards.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {cards.map((card) => (
              <div key={card.id} className="rounded-lg border border-black/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{card.cardType} Card</p>
                    <p className="text-xs text-muted">****{card.last4Digits}</p>
                  </div>
                  <Badge tone={card.status === 'ACTIVATED' ? 'success' : card.status === 'BLOCKED' || card.status === 'HOTLISTED' ? 'danger' : 'warning'}>
                    {card.status}
                  </Badge>
                </div>

                <div className="mt-3 space-y-1 text-xs">
                  <p>Expiry: {card.expiryDate}</p>
                  <p>Daily Limit: {card.dailyLimit}</p>
                  <p>PIN: {card.isPinSet ? '✓ Set' : '✗ Not set'}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {card.status !== 'BLOCKED' && card.status !== 'HOTLISTED' && (
                    <button
                      type="button"
                      className="rounded border border-red-600 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                      onClick={() => {
                        if (confirm('Block this card?')) {
                          blockM.mutate(card.id)
                        }
                      }}
                      disabled={blockM.isPending}
                    >
                      Block
                    </button>
                  )}

                  {card.status === 'BLOCKED' && (
                    <button
                      type="button"
                      className="rounded border border-green-600 px-2 py-1 text-xs font-semibold text-green-600 hover:bg-green-50"
                      onClick={() => unblockM.mutate(card.id)}
                      disabled={unblockM.isPending}
                    >
                      Unblock
                    </button>
                  )}

                  {card.status !== 'HOTLISTED' && (
                    <button
                      type="button"
                      className="rounded border border-orange-600 px-2 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-50"
                      onClick={() => {
                        if (confirm('Hotlist this card? (Permanent action)')) {
                          hotlistM.mutate(card.id)
                        }
                      }}
                      disabled={hotlistM.isPending}
                    >
                      Hotlist
                    </button>
                  )}

                  <button
                    type="button"
                    className="rounded border border-blue-600 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                    onClick={() => setShowPinForm(card.id)}
                  >
                    {card.isPinSet ? 'Change PIN' : 'Set PIN'}
                  </button>
                </div>

                {showPinForm === card.id && (
                  <div className="mt-4 space-y-2 border-t border-black/10 pt-4">
                    <Input
                      type="password"
                      placeholder="New PIN (4 digits)"
                      maxLength={4}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    />
                    <Input
                      type="password"
                      placeholder="Confirm PIN"
                      maxLength={4}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="flex-1 rounded border border-blue-600 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                        onClick={() => setPinM.mutate()}
                        disabled={!newPin || !confirmPin || setPinM.isPending}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="flex-1 rounded border border-black/10 px-2 py-1 text-xs font-semibold hover:bg-black/5"
                        onClick={() => {
                          setShowPinForm(null)
                          setNewPin('')
                          setConfirmPin('')
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No cards. Request one to get started.</p>
        )}
      </div>
    </div>
  )
}
