import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

import { bulkSalaryTransfer, bulkTransfer } from '../../api/transfers'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Spinner'
import { generateUUID } from '../../lib/utils'
import { useCustomerAccounts } from '../../lib/hooks'

export default function BulkTransferPage() {
  const accounts = useCustomerAccounts()
  const [sourceAccount, setSourceAccount] = useState('')
  const [transferType, setTransferType] = useState<'salary' | 'file'>('salary')
  const [pin, setPin] = useState('')
  const [items, setItems] = useState<Array<{ dest: string; amount: string; remarks: string }>>([
    { dest: '', amount: '', remarks: '' },
  ])

  const bulkMut = useMutation({
    mutationFn: async () => {
      const validItems = items.filter((i) => i.dest && i.amount)
      if (!validItems.length) {
        toast.error('Add at least one valid transfer item')
        return
      }

      const idempotencyKey = generateUUID()
      const payload = {
        sourceAccountNumber: sourceAccount,
        items: validItems.map((i) => ({
          destinationAccountNumber: i.dest,
          amount: parseFloat(i.amount),
          remarks: i.remarks,
        })),
        transactionPin: pin,
        remarks: `Bulk ${transferType} transfer`,
      }

      if (transferType === 'salary') {
        return bulkSalaryTransfer(payload, idempotencyKey)
      } else {
        return bulkTransfer(payload, idempotencyKey)
      }
    },
    onSuccess: (data) => {
      if (data) {
        toast.success(
          `${data.successCount}/${data.requestedCount} transfers completed successfully`
        )
      }
      setItems([{ dest: '', amount: '', remarks: '' }])
      setPin('')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Transfer failed')
    },
  })

  const addItem = () => {
    setItems([...items, { dest: '', amount: '', remarks: '' }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const totalAmount = items
    .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
    .toFixed(2)

  return (
    <div className="space-y-5">
      <header>
        <p className="chip">Customer</p>
        <h1 className="mt-3 font-display text-2xl font-semibold">Bulk Transfer</h1>
        <p className="mt-1 text-sm text-muted">Send multiple transfers in bulk</p>
      </header>

      <div className="surface p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="bulk-source-account" className="block text-xs font-semibold mb-2">Source Account</label>
            <select id="bulk-source-account" value={sourceAccount} onChange={(e) => setSourceAccount(e.target.value)} className="input w-full" aria-label="Source Account">
              <option value="">Select account...</option>
              {accounts.map((a: any) => (
                <option key={a.accountNumber} value={a.accountNumber}>
                  {a.accountNumber}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="bulk-transfer-type" className="block text-xs font-semibold mb-2">Transfer Type</label>
            <select
              id="bulk-transfer-type"
              value={transferType}
              onChange={(e) => setTransferType(e.target.value as 'salary' | 'file')}
              className="input w-full"
              aria-label="Transfer Type"
            >
              <option value="salary">Bulk Salary</option>
              <option value="file">Bulk File</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2">Transaction PIN</label>
            <Input
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="surface p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">Transfer Items ({items.length})</h2>
          <div className="text-right">
            <p className="text-sm text-muted">Total</p>
            <p className="text-lg font-semibold">₹{totalAmount}</p>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {items.map((item, idx) => (
            <div key={idx} className="grid gap-3 grid-cols-12 items-end p-3 rounded-lg bg-black/5">
              <Input
                placeholder="Destination Account"
                value={item.dest}
                onChange={(e) => updateItem(idx, 'dest', e.target.value)}
                className="col-span-4"
              />
              <Input
                type="number"
                placeholder="Amount"
                value={item.amount}
                onChange={(e) => updateItem(idx, 'amount', e.target.value)}
                className="col-span-2"
              />
              <Input
                placeholder="Remarks"
                value={item.remarks}
                onChange={(e) => updateItem(idx, 'remarks', e.target.value)}
                className="col-span-4"
              />
              <Button
                size="sm"
                onClick={() => removeItem(idx)}
                disabled={items.length === 1}
                className="col-span-2"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <Button onClick={addItem} variant="ghost" className="w-full">
          + Add Item
        </Button>

        <Button
          onClick={() => bulkMut.mutate()}
          disabled={
            bulkMut.isPending ||
            !sourceAccount ||
            !pin ||
            items.filter((i) => i.dest && i.amount).length === 0
          }
          variant="primary"
          className="w-full gap-2"
        >
          {bulkMut.isPending && <Spinner className="h-4 w-4" />}
          Process Bulk Transfer
        </Button>
      </div>
    </div>
  )
}
