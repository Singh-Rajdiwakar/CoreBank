import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Home, Send, CreditCard, Landmark, TrendingUp, Loader, FileText, HelpCircle, Settings } from 'lucide-react'
import { Sidebar } from '../../components/layout/Sidebar'
import { Navbar } from '../../components/layout/Navbar'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { ProtectedRoute } from '../../components/layout/ProtectedRoute'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Skeleton } from '../../components/common/Loading'
import { accountAPI } from '../../services/endpoints/accounts'
import { transferAPI } from '../../services/endpoints/transfers'
import { customerAPI } from '../../services/endpoints/customers'
import { formatCurrency, formatDate, maskAccountNumber } from '../../utils/formatting'
import { toast } from 'sonner'

export default function CustomerDashboardPage() {
  const [accounts, setAccounts] = useState([])
  const [recentTransfers, setRecentTransfers] = useState([])
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)

  const sidebarItems = [
    { path: '/customer/dashboard', label: 'Dashboard', icon: Home },
    { path: '/customer/transfers', label: 'Send Money', icon: Send },
    { path: '/customer/accounts', label: 'Accounts', icon: Landmark },
    { path: '/customer/cards', label: 'Cards', icon: CreditCard },
    { path: '/customer/deposits', label: 'FD & RD', icon: TrendingUp },
    { path: '/customer/loans', label: 'Loans', icon: Loader },
    { path: '/customer/disputes', label: 'Disputes', icon: HelpCircle },
    { path: '/customer/profile', label: 'Profile', icon: Settings },
  ]

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [customerData, accountsData, transfersData] = await Promise.all([
        customerAPI.getMe(),
        accountAPI.getAccounts(),
        transferAPI.getRecent(),
      ])

      setCustomer(customerData.data)
      setAccounts(accountsData.data || [])
      setRecentTransfers(transfersData.data || [])
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute requiredRole="ROLE_CUSTOMER">
      <DashboardLayout
        sidebar={<Sidebar items={sidebarItems} />}
        navbar={<Navbar title="Customer Dashboard" />}
      >
        <div className="space-y-8">
          {/* Greeting */}
          {loading ? (
            <Skeleton count={1} height={16} className="max-w-md" />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-orbitron font-bold gradient-text"
            >
              Good morning, {customer?.firstName} 👋
            </motion.div>
          )}

          {/* Account Cards */}
          <div>
            <h2 className="text-xl font-semibold mb-4 gradient-text">Your Accounts</h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} count={4} height={20} className="p-6" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {accounts.map((account, idx) => (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass rounded-xl p-6 hover:bg-white/20 transition-all duration-300 border-t-2 border-neon-blue"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-white/60 text-sm font-semibold">{account.accountType}</p>
                      <Badge variant="success" size="sm">
                        {account.status}
                      </Badge>
                    </div>

                    <p className="text-white/80 text-sm mb-4">
                      {maskAccountNumber(account.accountNumber)}
                    </p>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-2xl font-bold text-green-400 mb-6"
                    >
                      {formatCurrency(account.balance)}
                    </motion.p>

                    <Button variant="secondary" size="sm" className="w-full">
                      View Details
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold mb-4 gradient-text">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Send, label: 'Send Money' },
                { icon: CreditCard, label: 'Request Card' },
                { icon: TrendingUp, label: 'Create FD' },
                { icon: Loader, label: 'Apply Loan' },
              ].map((action, idx) => {
                const Icon = action.icon
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="glass rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-white/20 transition-all duration-300 border-t border-neon-blue"
                  >
                    <Icon className="text-neon-blue" size={24} />
                    <span className="text-sm font-semibold text-center">{action.label}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold mb-6 gradient-text">Recent Transactions</h2>

            {loading ? (
              <Skeleton count={5} height={16} className="p-4" />
            ) : recentTransfers.length === 0 ? (
              <div className="text-center py-8 text-white/60">No recent transactions</div>
            ) : (
              <div className="space-y-4">
                {recentTransfers.slice(0, 10).map((transfer, idx) => (
                  <motion.div
                    key={transfer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-white">{transfer.description}</p>
                      <p className="text-xs text-white/40 mt-1">{formatDate(transfer.createdAt)}</p>
                    </div>

                    <div className="text-right">
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-lg font-bold ${
                          transfer.type === 'DEBIT' ? 'text-red-400' : 'text-green-400'
                        }`}
                      >
                        {transfer.type === 'DEBIT' ? '-' : '+'}
                        {formatCurrency(transfer.amount)}
                      </motion.p>
                      <Badge
                        variant={
                          transfer.status === 'SUCCESS'
                            ? 'success'
                            : transfer.status === 'PENDING'
                              ? 'warning'
                              : 'danger'
                        }
                        size="sm"
                      >
                        {transfer.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
