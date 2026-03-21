import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { getCardTransactions } from '../../api/cards'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency, formatDate } from '../../lib/format'
import { useCustomerCards } from '../../lib/hooks'

export default function CardTransactionsPage() {
  const cards = useCustomerCards()
  const [selectedCard, setSelectedCard] = useState<string>('')

  const transactionsQ = useQuery({
    queryKey: ['card-transactions', selectedCard],
    queryFn: () => getCardTransactions(selectedCard, { limit: 100 }),
    enabled: !!selectedCard,
  })

  const transactions = transactionsQ.data ?? []

  return (
    <div className="space-y-5">
      <header>
        <p className="chip">Customer</p>
        <h1 className="mt-3 font-display text-2xl font-semibold">Card Transactions</h1>
        <p className="mt-1 text-sm text-muted">View your card transaction history</p>
      </header>

      <div className="surface p-6">
        <label className="block text-xs font-semibold mb-2">Select Card</label>
        <select
          value={selectedCard}
          onChange={(e) => setSelectedCard(e.target.value)}
          className="input w-full max-w-md"
        >
          <option value="">Choose a card...</option>
          {cards.map((c) => (
            <option key={c.id} value={c.maskedNumber}>
              {c.maskedNumber} • {c.status}
            </option>
          ))}
        </select>
      </div>

      {transactionsQ.isLoading ? (
        <div className="surface p-6 flex items-center gap-2 text-sm text-muted">
          <Spinner /> Loading transactions...
        </div>
      ) : transactions.length > 0 ? (
        <div className="surface p-6 space-y-3">
          <h2 className="font-semibold">Transactions ({transactions.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-left py-2 px-2">Reference</th>
                  <th className="text-left py-2 px-2">Description</th>
                  <th className="text-right py-2 px-2">Amount</th>
                  <th className="text-right py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-black/5">
                    <td className="py-2 px-2">{formatDate(t.initiatedAt)}</td>
                    <td className="py-2 px-2 font-mono text-xs">{t.referenceNumber}</td>
                    <td className="py-2 px-2 text-muted">{t.description}</td>
                    <td className="py-2 px-2 text-right font-semibold">
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <Badge
                        tone={
                          t.status === 'COMPLETED'
                            ? 'success'
                            : t.status === 'FAILED'
                              ? 'danger'
                              : 'neutral'
                        }
                      >
                        {t.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : selectedCard ? (
        <div className="surface p-6 text-center text-sm text-muted">
          No transactions found
        </div>
      ) : null}
    </div>
  )
}
