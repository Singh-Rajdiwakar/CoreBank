import React, { useState, useEffect } from 'react'
import { Check, X, Eye, Filter, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { transferAPI } from '../../services/endpoints/transfers'
import { formatCurrency, formatDate } from '../../utils/formatting'

const statusColors = {
  'PENDING': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  'APPROVED': 'bg-green-500/20 text-green-300 border-green-500/50',
  'REJECTED': 'bg-red-500/20 text-red-300 border-red-500/50',
  'COMPLETED': 'bg-blue-500/20 text-blue-300 border-blue-500/50'
}

export default function ManagerTransfers() {
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('PENDING')
  const [selectedTransfer, setSelectedTransfer] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    fetchTransfers()
  }, [filterStatus])

  const fetchTransfers = async () => {
    setLoading(true)
    try {
      const response = await transferAPI.getPending()
      const allTransfers = response.data?.data || []
      const filtered = filterStatus === 'ALL' 
        ? allTransfers 
        : allTransfers.filter(t => t.status === filterStatus)
      setTransfers(filtered)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load transfers')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (transferId) => {
    if (!window.confirm('Approve this transfer?')) return
    setProcessingId(transferId)
    try {
      await transferAPI.approve(transferId)
      toast.success('Transfer approved successfully')
      fetchTransfers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve transfer')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (transferId) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide rejection reason')
      return
    }
    if (!window.confirm('Reject this transfer?')) return
    
    setProcessingId(transferId)
    try {
      await transferAPI.reject(transferId, rejectionReason)
      toast.success('Transfer rejected successfully')
      setShowDetails(false)
      setRejectionReason('')
      fetchTransfers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject transfer')
    } finally {
      setProcessingId(null)
    }
  }

  const handleViewDetails = (transfer) => {
    setSelectedTransfer(transfer)
    setShowDetails(true)
  }

  const pendingCount = transfers.filter(t => t.status === 'PENDING').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Pending Transfers</h2>
        <p className="text-gray-400 mt-1">Review and approve customer transfers</p>
      </div>

      {/* Alert for pending transfers */}
      {pendingCount > 0 && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-yellow-400" size={20} />
          <div>
            <p className="text-yellow-300 font-semibold">{pendingCount} Pending Transfer{pendingCount !== 1 ? 's' : ''}</p>
            <p className="text-yellow-200 text-sm">Action required to process these transfers</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <Filter size={18} className="text-gray-400 mt-2" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
        >
          <option value="PENDING">Pending Only</option>
          <option value="ALL">All Transfers</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Transfers List */}
      {loading ? (
        <div className="h-64 bg-gray-800 rounded-lg animate-pulse" />
      ) : transfers.length === 0 ? (
        <div className="text-center py-12">
          <Eye className="mx-auto text-gray-500 mb-4" size={48} />
          <p className="text-gray-400">No transfers found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Transfer ID</th>
                <th className="text-left py-3 px-4 font-semibold">From Account</th>
                <th className="text-left py-3 px-4 font-semibold">To Beneficiary</th>
                <th className="text-left py-3 px-4 font-semibold">Amount</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Date</th>
                <th className="text-right py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {transfers.map(transfer => (
                <tr key={transfer.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-cyan-400 text-xs">{transfer.referenceId}</td>
                  <td className="py-3 px-4">{transfer.fromAccount?.accountNumber}</td>
                  <td className="py-3 px-4">{transfer.toAccName || transfer.beneficiaryName}</td>
                  <td className="py-3 px-4 font-semibold text-green-400">{formatCurrency(transfer.amount)}</td>
                  <td className="py-3 px-4 text-xs">
                    <span className="px-2 py-1 bg-gray-700 rounded">{transfer.type || 'NEFT'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[transfer.status] || ''}`}>
                      {transfer.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs">{formatDate(transfer.createdAt)}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewDetails(transfer)}
                        className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/50 rounded text-xs font-semibold transition-colors"
                      >
                        View
                      </button>
                      {transfer.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(transfer.id)}
                            disabled={processingId === transfer.id}
                            className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => handleViewDetails(transfer)}
                            disabled={processingId === transfer.id}
                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <X size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Transfer Details Modal */}
      {showDetails && selectedTransfer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Transfer Details - {selectedTransfer.referenceId}
              </h3>
              <button
                onClick={() => {
                  setShowDetails(false)
                  setRejectionReason('')
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Transfer Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">From Account</p>
                  <p className="text-white font-semibold">{selectedTransfer.fromAccount?.accountNumber}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">To Beneficiary</p>
                  <p className="text-white font-semibold">{selectedTransfer.toAccName || selectedTransfer.beneficiaryName}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Amount</p>
                  <p className="text-green-400 font-bold text-xl">{formatCurrency(selectedTransfer.amount)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Transfer Type</p>
                  <p className="text-white font-semibold">{selectedTransfer.type || 'NEFT'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border inline-block ${statusColors[selectedTransfer.status] || ''}`}>
                    {selectedTransfer.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Date</p>
                  <p className="text-white">{formatDate(selectedTransfer.createdAt)}</p>
                </div>
              </div>

              {/* IFSC Details */}
              {selectedTransfer.beneficiary?.ifscCode && (
                <div className="border-t border-gray-700 pt-6">
                  <h4 className="text-white font-semibold mb-3">Beneficiary Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">IFSC Code</p>
                      <p className="text-white font-mono">{selectedTransfer.beneficiary?.ifscCode}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Bank Name</p>
                      <p className="text-white">{selectedTransfer.beneficiary?.bankName}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400 text-sm">Account Type</p>
                      <p className="text-white">{selectedTransfer.beneficiary?.accountType || 'SAVINGS'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Remarks */}
              {selectedTransfer.remarks && (
                <div className="border-t border-gray-700 pt-6">
                  <p className="text-gray-400 text-sm mb-2">Remarks</p>
                  <p className="text-gray-300 bg-gray-800 p-3 rounded">{selectedTransfer.remarks}</p>
                </div>
              )}

              {/* Rejection Reason Input */}
              {selectedTransfer.status === 'PENDING' && (
                <div className="border-t border-gray-700 pt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rejection Reason (if rejecting)</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                    rows="3"
                  />
                </div>
              )}

              {/* Action Buttons */}
              {selectedTransfer.status === 'PENDING' && (
                <div className="border-t border-gray-700 pt-6 flex gap-2">
                  <button
                    onClick={() => {
                      handleApprove(selectedTransfer.id)
                      setShowDetails(false)
                    }}
                    disabled={processingId === selectedTransfer.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all disabled:opacity-50"
                  >
                    <Check size={18} />
                    {processingId === selectedTransfer.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(selectedTransfer.id)}
                    disabled={processingId === selectedTransfer.id || !rejectionReason.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all disabled:opacity-50"
                  >
                    <X size={18} />
                    {processingId === selectedTransfer.id ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDetails(false)
                      setRejectionReason('')
                    }}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}

              {selectedTransfer.status !== 'PENDING' && (
                <div className="border-t border-gray-700 pt-6">
                  <button
                    onClick={() => {
                      setShowDetails(false)
                      setRejectionReason('')
                    }}
                    className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
