import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, CheckCircle } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Input } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'
import { beneficiaryAPI as beneficiariesAPI } from '../../services/endpoints/beneficiaries'
import { toast } from 'sonner'
import { maskAccountNumber, formatDate } from '../../utils/formatting'

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  const [formData, setFormData] = useState({
    beneficiaryName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    accountType: 'SAVINGS',
  })

  useEffect(() => {
    loadBeneficiaries()
  }, [])

  const loadBeneficiaries = async () => {
    setLoading(true)
    try {
      const response = await beneficiariesAPI.getAll()
      setBeneficiaries(response.data || [])
    } catch (error) {
      toast.error('Failed to load beneficiaries')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCreateBeneficiary = async (e) => {
    e.preventDefault()
    if (!formData.beneficiaryName || !formData.accountNumber || !formData.ifscCode) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitLoading(true)
    try {
      await beneficiariesAPI.create(formData)
      toast.success('Beneficiary added successfully!')
      setShowCreateForm(false)
      setFormData({
        beneficiaryName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        accountType: 'SAVINGS',
      })
      loadBeneficiaries()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add beneficiary')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDeleteBeneficiary = async (beneficiaryId) => {
    if (!window.confirm('Are you sure you want to remove this beneficiary?')) return

    try {
      await beneficiariesAPI.delete(beneficiaryId)
      toast.success('Beneficiary removed')
      loadBeneficiaries()
    } catch (error) {
      toast.error('Failed to delete beneficiary')
    }
  }

  const getStatusBadge = (status) => {
    const config = {
      PENDING_VERIFICATION: { variant: 'warning', label: '⏳ Pending' },
      ACTIVE: { variant: 'success', label: '✓ Active' },
      INACTIVE: { variant: 'secondary', label: '⏸ Inactive' },
    }
    return config[status] || { variant: 'secondary', label: status }
  }

  if (loading) {
    return <div className="text-white/60">Loading beneficiaries...</div>
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-orbitron font-bold gradient-text mb-2">Beneficiaries</h1>
          <p className="text-white/60">Manage your saved beneficiaries</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-neon-blue text-white rounded-lg hover:bg-neon-blue/80 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Add Beneficiary
        </motion.button>
      </motion.div>

      {/* Beneficiaries Grid */}
      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {beneficiaries.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-white/60 mb-4">No beneficiaries added yet</p>
            <Button onClick={() => setShowCreateForm(true)}>Add Your First Beneficiary</Button>
          </Card>
        ) : (
          beneficiaries.map((ben, idx) => {
            const statusConfig = getStatusBadge(ben.status)
            const coolingPeriod = ben.coolingPeriodEndDate ? new Date(ben.coolingPeriodEndDate) > new Date() : false

            return (
              <motion.div
                key={ben.id}
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
                          {ben.beneficiaryName}
                        </h3>
                        <p className="text-sm text-white/60">
                          {ben.bankName}
                        </p>
                      </div>
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    </div>

                    {/* Account Details */}
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Account Number</span>
                        <span className="text-white font-mono">{maskAccountNumber(ben.accountNumber)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">IFSC Code</span>
                        <span className="text-white font-mono">{ben.ifscCode}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Account Type</span>
                        <span className="text-white">{ben.accountType}</span>
                      </div>
                    </div>

                    {/* Cooling Period Notice */}
                    {coolingPeriod && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm">
                        <p className="text-yellow-300">
                          ⚠️ Cooling period until {formatDate(ben.coolingPeriodEndDate)}
                        </p>
                      </div>
                    )}

                    {/* Verification Status */}
                    {ben.status === 'PENDING_VERIFICATION' && (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm">
                        <p className="text-blue-300">
                          ✓ Awaiting verification. You can make transfers once verified.
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 border-t border-white/10">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleDeleteBeneficiary(ben.id)}
                        className="w-full px-3 py-2 text-sm bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} /> Remove Beneficiary
                      </motion.button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })
        )}
      </motion.div>

      {/* Add Beneficiary Modal */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Add New Beneficiary"
        size="md"
      >
        <form onSubmit={handleCreateBeneficiary} className="space-y-4">
          <Input
            label="Beneficiary Name"
            placeholder="Full name"
            name="beneficiaryName"
            value={formData.beneficiaryName}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Account Number"
            placeholder="Bank account number"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleInputChange}
            required
          />

          <Input
            label="IFSC Code"
            placeholder="IFSC code"
            name="ifscCode"
            value={formData.ifscCode}
            onChange={handleInputChange}
            required
            maxLength="11"
          />

          <Input
            label="Bank Name (Optional)"
            placeholder="Bank name"
            name="bankName"
            value={formData.bankName}
            onChange={handleInputChange}
          />

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Account Type</label>
            <select
              name="accountType"
              value={formData.accountType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="SAVINGS">Savings</option>
              <option value="CURRENT">Current</option>
              <option value="NRE">NRE</option>
            </select>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm">
            <p className="text-blue-300">
              Note: New beneficiaries are verified within 24 hours and are subject to a cooling period.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={submitLoading} disabled={submitLoading}>
              Add
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
