import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LayoutDashboard, Clock, AlertCircle } from 'lucide-react'
import { Sidebar } from '../../components/layout/Sidebar'
import { Navbar } from '../../components/layout/Navbar'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { ProtectedRoute } from '../../components/layout/ProtectedRoute'
import { transferAPI } from '../../services/endpoints/transfers'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Modal } from '../../components/common/Modal'
import { formatCurrency, formatDate } from '../../utils/formatting'
import { toast } from 'sonner'

export default function ManagerDashboardPage() {
  const [pendingTransfers, setPendingTransfers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTransfer, setSelectedTransfer] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const sidebarItems = [
    { path: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/manager/transfers', label: 'Pending Transfers', icon: Clock },
    { path: '/manager/customers', label: 'Customers', icon: AlertCircle },
  ]

  useEffect(() => {
    fetchTransfers()
  }, [])

  const fetchTransfers = async () => {
    try {
      setLoading(true)
      const response = await transferAPI.getPending()
      setPendingTransfers(response.data?.data || [])
    } catch (error) {
      toast.error('Failed to load pending transfers')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      setActionLoading(true)
      await transferAPI.approve(id)
      toast.success('Transfer approved successfully')
      setPendingTransfers(pendingTransfers.filter((t) => t.id !== id))
      setSelectedTransfer(null)
      setConfirmAction(null)
    } catch (error) {
      toast.error('Failed to approve transfer')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (id, reason) => {
    try {
      setActionLoading(true)
      await transferAPI.reject(id, reason)
      toast.success('Transfer rejected successfully')
      setPendingTransfers(pendingTransfers.filter((t) => t.id !== id))
      setSelectedTransfer(null)
      setConfirmAction(null)
    } catch (error) {
      toast.error('Failed to reject transfer')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <ProtectedRoute requiredRole="ROLE_MANAGER">
      <DashboardLayout
        sidebar={<Sidebar items={sidebarItems} />}
        navbar={<Navbar title="Manager Dashboard" />}
      >
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <p className="text-white/60 text-sm mb-2">Pending Approvals</p>
              <p className="text-4xl font-bold gradient-text">{pendingTransfers.length}</p>
            </Card>
          </div>

          {/* Pending Transfers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold mb-6 gradient-text">Pending Transfers</h2>

            {pendingTransfers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/60">No pending transfers</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTransfers.map((transfer, idx) => (
                  <motion.div
                    key={transfer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-white">{transfer.description}</p>
                      <p className="text-sm text-white/60">
                        From: {transfer.fromAccount} → To: {transfer.toAccount}
                      </p>
                      <p className="text-xs text-white/40 mt-1">{formatDate(transfer.createdAt)}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-400">{formatCurrency(transfer.amount)}</p>
                        <Badge variant="warning" size="sm">
                          Pending
                        </Badge>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedTransfer(transfer)}
                      >
                        Review
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Modal for review */}
        <Modal
          isOpen={!!selectedTransfer}
          onClose={() => setSelectedTransfer(null)}
          title="Review Transfer"
          size="md"
        >
          {selectedTransfer && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <p className="text-white/60 text-sm">Amount</p>
                  <p className="text-2xl font-bold gradient-text">{formatCurrency(selectedTransfer.amount)}</p>
                </div>

                <div>
                  <p className="text-white/60 text-sm">From Account</p>
                  <p className="text-white font-semibold">{selectedTransfer.fromAccount}</p>
                </div>

                <div>
                  <p className="text-white/60 text-sm">To Account</p>
                  <p className="text-white font-semibold">{selectedTransfer.toAccount}</p>
                </div>

                <div>
                  <p className="text-white/60 text-sm">Description</p>
                  <p className="text-white">{selectedTransfer.description}</p>
                </div>

                <div>
                  <p className="text-white/60 text-sm">Requested At</p>
                  <p className="text-white">{formatDate(selectedTransfer.createdAt)}</p>
                </div>
              </div>

              {confirmAction === 'approve' && (
                <Button
                  onClick={() => handleApprove(selectedTransfer.id)}
                  loading={actionLoading}
                  className="w-full"
                >
                  Confirm Approval
                </Button>
              )}

              {confirmAction !== 'approve' && (
                <div className="flex gap-4">
                  <Button
                    onClick={() => setConfirmAction('approve')}
                    className="flex-1"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setConfirmAction('reject')}
                    className="flex-1"
                  >
                    Reject
                  </Button>
                </div>
              )}

              {confirmAction === 'reject' && (
                <Button
                  variant="danger"
                  onClick={() => {
                    handleReject(selectedTransfer.id, 'Rejected by manager')
                  }}
                  loading={actionLoading}
                  className="w-full"
                >
                  Confirm Rejection
                </Button>
              )}
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
