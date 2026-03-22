import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, TrendingUp } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Input } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'
import { depositAPI as depositsAPI } from '../../services/endpoints/deposits'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '../../utils/formatting'

export default function DepositsPage() {
  const [fds, setFds] = useState([])
  const [rds, setRds] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('fd')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  const [formData, setFormData] = useState({
    principalAmount: '',
    tenureMonths: '',
    rateOfInterest: '',
    accountNumber: '',
    maturityAmount: '',
  })

  useEffect(() => {
    loadDeposits()
  }, [])

  const loadDeposits = async () => {
    setLoading(true)
    try {
      const [fdRes, rdRes] = await Promise.all([
        depositsAPI.getMyFDs(),
        depositsAPI.getMyRDs(),
      ])
      setFds(fdRes.data || [])
      setRds(rdRes.data || [])
    } catch (error) {
      toast.error('Failed to load deposits')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Calculate maturity amount
    if (name === 'principalAmount' || name === 'tenureMonths' || name === 'rateOfInterest') {
      const principal = parseFloat(formData.principalAmount) || 0
      const rate = parseFloat(formData.rateOfInterest) || 0
      const tenure = parseInt(formData.tenureMonths) || 0

      if (principal && rate && tenure) {
        const maturity = principal * Math.pow(1 + rate / 100 / 12, tenure)
        setFormData(prev => ({ ...prev, maturityAmount: maturity.toFixed(2) }))
      }
    }
  }

  const handleCreateDeposit = async (e) => {
    e.preventDefault()
    if (!formData.principalAmount || !formData.tenureMonths || !formData.accountNumber) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitLoading(true)
    try {
      if (activeTab === 'fd') {
        await depositsAPI.createFD({
          principalAmount: parseFloat(formData.principalAmount),
          tenureMonths: parseInt(formData.tenureMonths),
          accountNumber: formData.accountNumber,
        })
        toast.success('FD created successfully!')
      } else {
        await depositsAPI.createRD({
          principalAmount: parseFloat(formData.principalAmount),
          tenureMonths: parseInt(formData.tenureMonths),
          accountNumber: formData.accountNumber,
        })
        toast.success('RD created successfully!')
      }
      
      setShowCreateForm(false)
      setFormData({
        principalAmount: '',
        tenureMonths: '',
        rateOfInterest: '',
        accountNumber: '',
        maturityAmount: '',
      })
      loadDeposits()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Creation failed')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleWithdraw = async (fdNumber) => {
    if (!window.confirm('Are you sure? Premature withdrawal may incur penalty.')) return

    try {
      await depositsAPI.withdrawFD(fdNumber)
      toast.success('FD withdrawal initiated')
      loadDeposits()
    } catch (error) {
      toast.error('Withdrawal failed')
    }
  }

  const getStatusBadge = (status) => {
    const config = {
      ACTIVE: { variant: 'success', label: '✓ Active' },
      MATURED: { variant: 'info', label: '✓ Matured' },
      CLOSED: { variant: 'secondary', label: '✕ Closed' },
      WITHDRAWN: { variant: 'secondary', label: '✕ Withdrawn' },
    }
    return config[status] || { variant: 'secondary', label: status }
  }

  if (loading) {
    return <div className="text-white/60">Loading deposits...</div>
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-orbitron font-bold gradient-text mb-2">FD & RD Products</h1>
          <p className="text-white/60">Fixed and Recurring Deposits</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-neon-blue text-white rounded-lg hover:bg-neon-blue/80 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Create {activeTab.toUpperCase()}
        </motion.button>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {['fd', 'rd'].map((tab) => (
          <motion.button
            key={tab}
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === tab
                ? 'bg-neon-blue text-white shadow-lg shadow-neon-blue/50'
                : 'bg-white/5 text-white/70 border border-white/10 hover:border-neon-blue/50'
            }`}
          >
            {tab === 'fd' ? 'Fixed Deposits' : 'Recurring Deposits'}
          </motion.button>
        ))}
      </div>

      {/* Deposits Grid */}
      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {(activeTab === 'fd' ? fds : rds).length === 0 ? (
          <Card className="text-center py-12">
            <TrendingUp size={48} className="mx-auto mb-4 text-white/40" />
            <p className="text-white/60 mb-4">No {activeTab.toUpperCase()} products yet</p>
            <Button onClick={() => setShowCreateForm(true)}>Create {activeTab.toUpperCase()}</Button>
          </Card>
        ) : (
          (activeTab === 'fd' ? fds : rds).map((deposit, idx) => {
            const statusConfig = getStatusBadge(deposit.status)
            const progressPercent = ((new Date() - new Date(deposit.createdAt)) / (new Date(deposit.maturityDate) - new Date(deposit.createdAt))) * 100

            return (
              <motion.div
                key={deposit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card>
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {deposit.type === 'FD' ? 'Fixed Deposit' : 'Recurring Deposit'}
                        </h3>
                        <p className="text-sm text-white/60">
                          {deposit.depositNumber}
                        </p>
                      </div>
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    </div>

                    {/* Amount & Interest */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-xs text-white/60 mb-1">Principal</p>
                        <p className="font-bold text-white">{formatCurrency(deposit.principalAmount)}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-xs text-white/60 mb-1">Rate</p>
                        <p className="font-bold text-neon-cyan">{deposit.rateOfInterest}% p.a</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-xs text-white/60 mb-1">Maturity</p>
                        <p className="font-bold text-green-400">{formatCurrency(deposit.maturityAmount)}</p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-white/60 text-xs">Opened</p>
                        <p className="text-white font-semibold">{formatDate(deposit.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs">Matures</p>
                        <p className="text-white font-semibold">{formatDate(deposit.maturityDate)}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <p className="text-xs text-white/60 mb-2">Tenure Progress</p>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                          className="h-full bg-gradient-to-r from-neon-blue to-neon-cyan"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    {deposit.status === 'ACTIVE' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleWithdraw(deposit.depositNumber)}
                        className="w-full px-4 py-2 text-sm bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg transition-all"
                      >
                        Withdraw Prematurely
                      </motion.button>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })
        )}
      </motion.div>

      {/* Create Deposit Modal */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title={`Create ${activeTab === 'fd' ? 'Fixed' : 'Recurring'} Deposit`}
        size="md"
      >
        <form onSubmit={handleCreateDeposit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Account</label>
            <select
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="">Select account</option>
              {/* Accounts would be loaded from API */}
            </select>
          </div>

          <Input
            label="Principal Amount"
            type="number"
            placeholder="0.00"
            name="principalAmount"
            value={formData.principalAmount}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
          />

          <Input
            label="Tenure (Months)"
            type="number"
            placeholder="12"
            name="tenureMonths"
            value={formData.tenureMonths}
            onChange={handleInputChange}
            required
            min="1"
            max="240"
          />

          <Input
            label="Interest Rate (% p.a)"
            type="number"
            placeholder="7.5"
            name="rateOfInterest"
            value={formData.rateOfInterest}
            onChange={handleInputChange}
            step="0.01"
          />

          {formData.maturityAmount && (
            <div className="bg-neon-blue/10 border border-neon-blue/30 rounded-lg p-3">
              <p className="text-white/60 text-sm">Estimated Maturity Amount</p>
              <p className="text-2xl font-bold text-neon-cyan">{formatCurrency(formData.maturityAmount)}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={submitLoading} disabled={submitLoading}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
