import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, ArrowRight, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Modal } from '../../components/common/Modal'
import { transferAPI } from '../../services/endpoints/transfers'
import { accountAPI } from '../../services/endpoints/accounts'
import { beneficiaryAPI } from '../../services/endpoints/beneficiaries'
import { useAuth } from '../../hooks/useAuth'
import { toast } from 'sonner'
import { generateUUID, formatCurrency } from '../../utils/formatting'

export default function TransfersPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('upi')
  const [accounts, setAccounts] = useState([])
  const [beneficiaries, setBeneficiaries] = useState([])
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [transferData, setTransferData] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    sourceAccount: '',
    destinationAccount: '',
    amount: '',
    remarks: '',
    transactionPin: '',
    scheduleDate: '',
    recurringMonths: 1,
  })

  useEffect(() => {
    loadAccounts()
    loadBeneficiaries()
  }, [])

  const loadAccounts = async () => {
    try {
      const response = await accountAPI.getAccounts()
      setAccounts(response.data || [])
    } catch (error) {
      toast.error('Failed to load accounts')
    }
  }

  const loadBeneficiaries = async () => {
    try {
      const response = await beneficiaryAPI.getAll()
      setBeneficiaries(response.data || [])
    } catch (error) {
      console.log('No beneficiaries loaded')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.sourceAccount || !formData.destinationAccount || !formData.amount) {
      toast.error('Please fill in all required fields')
      return false
    }
    if (parseFloat(formData.amount) <= 0) {
      toast.error('Amount must be greater than 0')
      return false
    }
    if (activeTab !== 'internal' && activeTab !== 'self' && !formData.transactionPin) {
      toast.error('Transaction PIN is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const idempotencyKey = generateUUID()
    setTransferData({ ...formData, idempotencyKey })
    setShowConfirm(true)
  }

  const confirmTransfer = async () => {
    setLoading(true)
    try {
      let response
      const payload = {
        sourceAccountNumber: formData.sourceAccount,
        destinationAccountNumber: formData.destinationAccount,
        amount: parseFloat(formData.amount),
        remarks: formData.remarks,
        transactionPin: formData.transactionPin,
      }

      switch (activeTab) {
        case 'upi':
          response = await transferAPI.sendUPI(payload)
          break
        case 'neft':
          response = await transferAPI.sendNEFT(payload)
          break
        case 'rtgs':
          response = await transferAPI.sendRTGS(payload)
          break
        case 'imps':
          response = await transferAPI.sendIMPS(payload)
          break
        case 'internal':
          response = await transferAPI.internal(payload)
          break
        case 'self':
          response = await transferAPI.self(payload)
          break
        case 'scheduled':
          response = await transferAPI.scheduled({ ...payload, scheduleDateTime: formData.scheduleDate })
          break
        case 'recurring':
          response = await transferAPI.recurring({ ...payload, recurringMonths: formData.recurringMonths })
          break
        default:
          return
      }

      toast.success(`Transfer initiated! Reference: ${response.data?.referenceNumber}`)
      setFormData({
        sourceAccount: '',
        destinationAccount: '',
        amount: '',
        remarks: '',
        transactionPin: '',
        scheduleDate: '',
        recurringMonths: 1,
      })
      setShowConfirm(false)
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Transfer failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'upi', label: 'UPI', icon: '💳' },
    { id: 'imps', label: 'IMPS', icon: '⚡' },
    { id: 'neft', label: 'NEFT', icon: '🏦' },
    { id: 'rtgs', label: 'RTGS', icon: '🔄' },
    { id: 'internal', label: 'Internal', icon: '↔️' },
    { id: 'self', label: 'Self', icon: '🔐' },
    { id: 'scheduled', label: 'Scheduled', icon: '⏰' },
    { id: 'recurring', label: 'Recurring', icon: '🔁' },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-orbitron font-bold gradient-text mb-2">Send Money</h1>
        <p className="text-white/60">Transfer funds securely across various channels</p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2 overflow-x-auto pb-2"
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-neon-blue text-white border-neon-blue neon-glow'
                : 'bg-white/5 text-white/70 border border-white/10 hover:border-neon-blue/50'
            }`}
          >
            {tab.icon} {tab.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Transfer Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Source Account */}
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">From Account</label>
              <select
                name="sourceAccount"
                value={formData.sourceAccount}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-neon-blue focus:outline-none transition-all duration-300"
              >
                <option value="">Select source account</option>
                {accounts.map(acc => (
                  <option key={acc.accountNumber} value={acc.accountNumber}>
                    {acc.accountNumber} ({acc.type}) - {formatCurrency(acc.currentBalance)}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Account */}
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">To Account</label>
              {activeTab === 'upi' ? (
                <Input
                  label="UPI ID"
                  placeholder="user@bank"
                  name="destinationAccount"
                  value={formData.destinationAccount}
                  onChange={handleInputChange}
                  required
                />
              ) : (
                <select
                  name="destinationAccount"
                  value={formData.destinationAccount}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-neon-blue focus:outline-none transition-all duration-300"
                >
                  <option value="">Select beneficiary or account</option>
                  {beneficiaries.map(ben => (
                    <option key={ben.id} value={ben.accountNumber}>
                      {ben.beneficiaryName} - {ben.accountNumber}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Amount */}
            <Input
              label="Amount"
              type="number"
              placeholder="0.00"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
            />

            {/* Remarks */}
            <Input
              label="Remarks (Optional)"
              placeholder="Transfer description"
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
            />

            {/* Scheduled Date (for scheduled transfers) */}
            {activeTab === 'scheduled' && (
              <Input
                label="Schedule Date & Time"
                type="datetime-local"
                name="scheduleDate"
                value={formData.scheduleDate}
                onChange={handleInputChange}
                required
              />
            )}

            {/* Recurring Months (for recurring transfers) */}
            {activeTab === 'recurring' && (
              <Input
                label="Duration (Months)"
                type="number"
                placeholder="12"
                name="recurringMonths"
                value={formData.recurringMonths}
                onChange={handleInputChange}
                required
                min="1"
                max="60"
              />
            )}

            {/* Transaction PIN */}
            {activeTab !== 'internal' && activeTab !== 'self' && (
              <Input
                label="Transaction PIN"
                type="password"
                placeholder="Enter 6-digit PIN"
                name="transactionPin"
                value={formData.transactionPin}
                onChange={handleInputChange}
                maxLength="6"
                required
              />
            )}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                <Send size={18} className="mr-2" />
                Review Transfer
              </Button>
            </motion.div>
          </form>
        </Card>
      </motion.div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Transfer"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-neon-blue/10 border border-neon-blue/30 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-white/60">From Account:</span>
              <span className="text-white font-semibold">{formData.sourceAccount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">To Account:</span>
              <span className="text-white font-semibold">{formData.destinationAccount}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
              <span className="text-white/60">Amount:</span>
              <span className="text-neon-cyan font-bold text-lg">{formatCurrency(formData.amount)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowConfirm(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={confirmTransfer}
              loading={loading}
              disabled={loading}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
