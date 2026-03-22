import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, DollarSign, Calendar } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Input } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'
import { loanAPI as loansAPI } from '../../services/endpoints/loans'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '../../utils/formatting'

export default function LoansPage() {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [showEmiSchedule, setShowEmiSchedule] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [emiSchedule, setEmiSchedule] = useState([])
  const [submitLoading, setSubmitLoading] = useState(false)

  const [formData, setFormData] = useState({
    loanType: 'PERSONAL',
    principalAmount: '',
    tenureMonths: '',
    accountNumber: '',
    purpose: '',
    annualIncome: '',
  })

  useEffect(() => {
    loadLoans()
  }, [])

  const loadLoans = async () => {
    setLoading(true)
    try {
      const response = await loansAPI.getMyLoans()
      setLoans(response.data || [])
    } catch (error) {
      toast.error('Failed to load loans')
    } finally {
      setLoading(false)
    }
  }

  const loadEmiSchedule = async (loanNumber) => {
    try {
      const response = await loansAPI.getEmiSchedule(loanNumber)
      setEmiSchedule(response.data || [])
      setShowEmiSchedule(true)
    } catch (error) {
      toast.error('Failed to load EMI schedule')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleApplyLoan = async (e) => {
    e.preventDefault()
    if (!formData.loanType || !formData.principalAmount || !formData.tenureMonths || !formData.accountNumber) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitLoading(true)
    try {
      await loansAPI.applyLoan({
        loanType: formData.loanType,
        principalAmount: parseFloat(formData.principalAmount),
        tenureMonths: parseInt(formData.tenureMonths),
        disbursementAccountNumber: formData.accountNumber,
        purpose: formData.purpose,
      })
      toast.success('Loan application submitted successfully!')
      setShowApplyForm(false)
      setFormData({
        loanType: 'PERSONAL',
        principalAmount: '',
        tenureMonths: '',
        accountNumber: '',
        purpose: '',
        annualIncome: '',
      })
      loadLoans()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Application failed')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handlePayEmi = async (loanNumber) => {
    try {
      await loansAPI.payEmi(loanNumber)
      toast.success('EMI payment successful!')
      loadLoans()
    } catch (error) {
      toast.error('EMI payment failed')
    }
  }

  const getStatusBadge = (status) => {
    const config = {
      APPLIED: { variant: 'info', label: '⏳ Applied' },
      APPROVED: { variant: 'success', label: '✓ Approved' },
      DISBURSED: { variant: 'success', label: '💰 Disbursed' },
      CLOSED: { variant: 'secondary', label: '✕ Closed' },
      REJECTED: { variant: 'danger', label: '❌ Rejected' },
    }
    return config[status] || { variant: 'secondary', label: status }
  }

  if (loading) {
    return <div className="text-white/60">Loading loans...</div>
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-orbitron font-bold gradient-text mb-2">My Loans</h1>
          <p className="text-white/60">Manage your loans and EMI payments</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowApplyForm(true)}
          className="px-4 py-2 bg-neon-blue text-white rounded-lg hover:bg-neon-blue/80 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Apply Loan
        </motion.button>
      </motion.div>

      {/* Loans Grid */}
      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {loans.length === 0 ? (
          <Card className="text-center py-12">
            <DollarSign size={48} className="mx-auto mb-4 text-white/40" />
            <p className="text-white/60 mb-4">No loans yet</p>
            <Button onClick={() => setShowApplyForm(true)}>Apply for Loan</Button>
          </Card>
        ) : (
          loans.map((loan, idx) => {
            const statusConfig = getStatusBadge(loan.status)
            const outstandingPercent = (loan.outstandingPrincipal / loan.principalAmount) * 100

            return (
              <motion.div
                key={loan.loanNumber}
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
                          {loan.loanType} Loan
                        </h3>
                        <p className="text-sm text-white/60">
                          Loan#: {loan.loanNumber}
                        </p>
                      </div>
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    </div>

                    {/* Key Numbers */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-xs text-white/60 mb-1">Sanctioned</p>
                        <p className="font-bold text-white text-sm">{formatCurrency(loan.principalAmount)}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-xs text-white/60 mb-1">Rate</p>
                        <p className="font-bold text-neon-cyan">{loan.interestRate}% p.a</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-xs text-white/60 mb-1">EMI</p>
                        <p className="font-bold text-green-400">{formatCurrency(loan.emiAmount)}</p>
                      </div>
                    </div>

                    {/* Outstanding Principal Progress */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <p className="text-sm text-white/60">Outstanding Principal</p>
                        <p className="text-sm font-bold text-white">{formatCurrency(loan.outstandingPrincipal)}</p>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${outstandingPercent}%` }}
                          className="h-full bg-gradient-to-r from-red-500/50 to-orange-500/50"
                        />
                      </div>
                    </div>

                    {/* Loan Dates */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-white/60 text-xs">Disbursed On</p>
                        <p className="text-white font-semibold">{formatDate(loan.disbursementDate)}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs">Matures</p>
                        <p className="text-white font-semibold">{formatDate(loan.maturityDate)}</p>
                      </div>
                    </div>

                    {/* Next EMI Due */}
                    {loan.status === 'DISBURSED' && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                        <p className="text-yellow-300 text-sm font-semibold mb-1">Next EMI Due</p>
                        <div className="flex justify-between items-center">
                          <span className="text-white">{formatDate(loan.nextEmiDueDate)}</span>
                          <span className="text-yellow-400 font-bold">{formatCurrency(loan.emiAmount)}</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/10">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => {
                          setSelectedLoan(loan)
                          loadEmiSchedule(loan.loanNumber)
                        }}
                        className="px-3 py-2 text-xs bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg transition-all"
                      >
                        EMI Schedule
                      </motion.button>

                      {loan.status === 'DISBURSED' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handlePayEmi(loan.loanNumber)}
                          className="px-3 py-2 text-xs bg-green-500/20 hover:bg-green-500/40 text-green-300 rounded-lg transition-all"
                        >
                          Pay EMI
                        </motion.button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })
        )}
      </motion.div>

      {/* Apply Loan Modal */}
      <Modal
        isOpen={showApplyForm}
        onClose={() => setShowApplyForm(false)}
        title="Apply for Loan"
        size="md"
      >
        <form onSubmit={handleApplyLoan} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Loan Type</label>
            <select
              name="loanType"
              value={formData.loanType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="PERSONAL">Personal Loan</option>
              <option value="HOME">Home Loan</option>
              <option value="CAR">Car Loan</option>
              <option value="EDUCATION">Education Loan</option>
            </select>
          </div>

          <Input
            label="Loan Amount"
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
            max="360"
          />

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Disbursement Account</label>
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
            label="Purpose"
            placeholder="Purpose of loan"
            name="purpose"
            value={formData.purpose}
            onChange={handleInputChange}
          />

          <Input
            label="Annual Income"
            type="number"
            placeholder="0.00"
            name="annualIncome"
            value={formData.annualIncome}
            onChange={handleInputChange}
            min="0"
            step="0.01"
          />

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowApplyForm(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={submitLoading} disabled={submitLoading}>
              Apply
            </Button>
          </div>
        </form>
      </Modal>

      {/* EMI Schedule Modal */}
      <Modal
        isOpen={showEmiSchedule}
        onClose={() => setShowEmiSchedule(false)}
        title={`EMI Schedule - ${selectedLoan?.loanNumber}`}
        size="lg"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {emiSchedule.length === 0 ? (
            <p className="text-white/60 text-center py-4">No EMI schedule</p>
          ) : (
            emiSchedule.map((emi, idx) => (
              <div
                key={idx}
                className="p-3 bg-white/5 rounded-lg border border-white/10 text-sm"
              >
                <div className="flex justify-between mb-1">
                  <span className="text-white font-semibold">
                    EMI #{emi.installmentNumber} - {formatDate(emi.dueDate)}
                  </span>
                  <span className={`font-bold ${emi.status === 'PAID' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {formatCurrency(emi.emiAmount)} ({emi.status})
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-white/60 text-xs">
                  <span>Principal: {formatCurrency(emi.principalComponent)}</span>
                  <span>Interest: {formatCurrency(emi.interestComponent)}</span>
                  <span>Balance: {formatCurrency(emi.balanceAfterEmi)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  )
}
