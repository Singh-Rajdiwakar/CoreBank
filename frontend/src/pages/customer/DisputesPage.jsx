import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, AlertCircle, FileText } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Input } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'
import { disputeAPI } from '../../services/endpoints/disputes'
import { toast } from 'sonner'
import { formatDate, formatCurrency } from '../../utils/formatting'

export default function DisputesPage() {
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)

  const [formData, setFormData] = useState({
    transactionId: '',
    category: 'UNAUTHORIZED_TRANSACTION',
    priority: 'MEDIUM',
    description: '',
    reportedChannel: 'MOBILE_APP',
  })

  useEffect(() => {
    loadDisputes()
  }, [])

  const loadDisputes = async () => {
    setLoading(true)
    try {
      const response = await disputeAPI.getMyDisputes()
      setDisputes(response.data || [])
    } catch (error) {
      toast.error('Failed to load disputes')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCreateDispute = async (e) => {
    e.preventDefault()
    if (!formData.transactionId || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitLoading(true)
    try {
      await disputeAPI.createDispute(formData)
      toast.success('Dispute filed successfully!')
      setShowCreateForm(false)
      setFormData({
        transactionId: '',
        category: 'UNAUTHORIZED_TRANSACTION',
        priority: 'MEDIUM',
        description: '',
        reportedChannel: 'MOBILE_APP',
      })
      loadDisputes()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create dispute')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleUploadEvidence = async (e, disputeNumber) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadLoading(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append('file', file)
      formDataObj.append('description', 'Supporting evidence')

      await disputeAPI.uploadEvidence(disputeNumber, formDataObj)
      toast.success('Evidence uploaded successfully')
      loadDisputes()
    } catch (error) {
      toast.error('Failed to upload evidence')
    } finally {
      setUploadLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const config = {
      OPEN: { variant: 'info', label: '⏳ Open' },
      ASSIGNED: { variant: 'warning', label: '👤 Assigned' },
      INVESTIGATION: { variant: 'warning', label: '🔍 Investigating' },
      RESOLVED: { variant: 'success', label: '✓ Resolved' },
      CLOSED: { variant: 'secondary', label: '✕ Closed' },
      REJECTED: { variant: 'danger', label: '❌ Rejected' },
    }
    return config[status] || { variant: 'secondary', label: status }
  }

  if (loading) {
    return <div className="text-white/60">Loading disputes...</div>
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-orbitron font-bold gradient-text mb-2">Disputes & Cases</h1>
          <p className="text-white/60">Manage your disputes and transaction issues</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-neon-blue text-white rounded-lg hover:bg-neon-blue/80 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> File Dispute
        </motion.button>
      </motion.div>

      {/* Disputes Grid */}
      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {disputes.length === 0 ? (
          <Card className="text-center py-12">
            <AlertCircle size={48} className="mx-auto mb-4 text-white/40" />
            <p className="text-white/60 mb-4">No disputes filed</p>
            <Button onClick={() => setShowCreateForm(true)}>File Your First Dispute</Button>
          </Card>
        ) : (
          disputes.map((dispute, idx) => {
            const statusConfig = getStatusBadge(dispute.status)

            return (
              <motion.div
                key={dispute.caseNumber}
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
                          {dispute.category}
                        </h3>
                        <p className="text-sm text-white/60">
                          Case#: {dispute.caseNumber}
                        </p>
                      </div>
                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    </div>

                    {/* Dispute Info */}
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Transaction ID</span>
                        <span className="text-white font-semibold">{dispute.transactionId?.slice(0, 12)}...</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Disputed Amount</span>
                        <span className="text-red-400 font-bold">{formatCurrency(dispute.disputeAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Filed On</span>
                        <span className="text-white">{formatDate(dispute.filedDate)}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <p className="text-white/60 text-sm mb-2">Description</p>
                      <p className="text-white text-sm line-clamp-3">{dispute.description}</p>
                    </div>

                    {/* Priority & Evidence */}
                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/10">
                      <Badge
                        variant={
                          dispute.priority === 'HIGH'
                            ? 'danger'
                            : dispute.priority === 'MEDIUM'
                            ? 'warning'
                            : 'secondary'
                        }
                      >
                        {dispute.priority} Priority
                      </Badge>
                      <Badge variant={dispute.evidenceCount > 0 ? 'success' : 'secondary'}>
                        {dispute.evidenceCount} Evidence Files
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => {
                          setSelectedDispute(dispute)
                          setShowDetails(true)
                        }}
                        className="px-3 py-2 text-xs bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg transition-all"
                      >
                        View Details
                      </motion.button>

                      <label className="px-3 py-2 text-xs bg-green-500/20 hover:bg-green-500/40 text-green-300 rounded-lg transition-all cursor-pointer text-center">
                        <input
                          type="file"
                          hidden
                          onChange={(e) => handleUploadEvidence(e, dispute.caseNumber)}
                          disabled={uploadLoading}
                        />
                        {uploadLoading ? 'Uploading...' : 'Add Evidence'}
                      </label>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })
        )}
      </motion.div>

      {/* File Dispute Modal */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="File a Dispute"
        size="md"
      >
        <form onSubmit={handleCreateDispute} className="space-y-4">
          <Input
            label="Transaction ID"
            placeholder="Enter transaction ID"
            name="transactionId"
            value={formData.transactionId}
            onChange={handleInputChange}
            required
          />

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="UNAUTHORIZED_TRANSACTION">Unauthorized Transaction</option>
              <option value="DUPLICATE_CHARGE">Duplicate Charge</option>
              <option value="FAILED_TRANSACTION">Failed Transaction</option>
              <option value="INCORRECT_AMOUNT">Incorrect Amount</option>
              <option value="SERVICE_COMPLAINT">Service Complaint</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Reported Channel</label>
            <select
              name="reportedChannel"
              value={formData.reportedChannel}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="MOBILE_APP">Mobile App</option>
              <option value="EMAIL">Email</option>
              <option value="PHONE">Phone</option>
              <option value="BRANCH">Branch</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the issue in detail"
              required
              rows="4"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-neon-blue focus:outline-none transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={submitLoading} disabled={submitLoading}>
              File Dispute
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dispute Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title={`Dispute Details - ${selectedDispute?.caseNumber}`}
        size="lg"
      >
        {selectedDispute && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/60 mb-1">Case Number</p>
                <p className="text-white font-semibold">{selectedDispute.caseNumber}</p>
              </div>
              <div>
                <p className="text-white/60 mb-1">Status</p>
                <Badge variant={getStatusBadge(selectedDispute.status).variant}>
                  {getStatusBadge(selectedDispute.status).label}
                </Badge>
              </div>
              <div>
                <p className="text-white/60 mb-1">Category</p>
                <p className="text-white font-semibold">{selectedDispute.category}</p>
              </div>
              <div>
                <p className="text-white/60 mb-1">Amount</p>
                <p className="text-red-400 font-bold">{formatCurrency(selectedDispute.disputeAmount)}</p>
              </div>
            </div>

            <div>
              <p className="text-white/60 text-sm mb-2">Description</p>
              <p className="text-white text-sm bg-white/5 p-3 rounded-lg border border-white/10">
                {selectedDispute.description}
              </p>
            </div>

            {selectedDispute.resolution && (
              <div>
                <p className="text-white/60 text-sm mb-2">Resolution</p>
                <p className="text-white text-sm bg-green-500/10 p-3 rounded-lg border border-green-500/30">
                  {selectedDispute.resolution}
                </p>
              </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm">
              <p className="text-blue-300">
                Need help? Contact our support team for case assistance.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
