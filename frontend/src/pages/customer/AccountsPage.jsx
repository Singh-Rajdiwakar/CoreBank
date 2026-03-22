import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, Eye, EyeOff, Calendar } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Badge } from '../../components/common/Badge'
import { Input } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'
import { accountAPI } from '../../services/endpoints/accounts'
import { toast } from 'sonner'
import { formatCurrency, formatDate, maskAccountNumber } from '../../utils/formatting'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showStatement, setShowStatement] = useState(false)
  const [showPassbook, setShowPassbook] = useState(false)
  const [showMiniStatement, setShowMiniStatement] = useState(false)
  const [statementData, setStatementData] = useState([])
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [visibleBalances, setVisibleBalances] = useState({})

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    setLoading(true)
    try {
      const response = await accountsAPI.getAccounts()
      setAccounts(response.data || [])
    } catch (error) {
      toast.error('Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  const loadStatement = async (accountNumber) => {
    try {
      const response = await accountAPI.getStatement(accountNumber, {
        from: filterFrom,
        to: filterTo
      })
      setStatementData(response.data?.transactions || [])
      setShowStatement(true)
    } catch (error) {
      toast.error('Failed to load statement')
    }
  }

  const loadMiniStatement = async (accountNumber) => {
    try {
      const response = await accountAPI.getMiniStatement(accountNumber)
      setStatementData(response.data?.transactions || [])
      setShowMiniStatement(true)
    } catch (error) {
      toast.error('Failed to load mini statement')
    }
  }

  const loadPassbook = async (accountNumber) => {
    try {
      const response = await accountAPI.getPassbook(accountNumber)
      setStatementData(response.data?.transactions || [])
      setShowPassbook(true)
    } catch (error) {
      toast.error('Failed to load passbook')
    }
  }

  const toggleBalance = (accountNumber) => {
    setVisibleBalances(prev => ({
      ...prev,
      [accountNumber]: !prev[accountNumber]
    }))
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { variant: 'success', label: '✓ Active' },
      DORMANT: { variant: 'warning', label: '⏸ Dormant' },
      BLOCKED: { variant: 'danger', label: '🔒 Blocked' },
      CLOSED: { variant: 'secondary', label: '✕ Closed' },
    }
    return statusConfig[status] || { variant: 'secondary', label: status }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-40 bg-gradient-to-r from-white/5 to-transparent" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-orbitron font-bold gradient-text mb-2">My Accounts</h1>
        <p className="text-white/60">View and manage your accounts</p>
      </motion.div>

      {/* Accounts Grid */}
      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {accounts.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-white/60 text-lg">No accounts found</p>
          </Card>
        ) : (
          accounts.map((account, idx) => {
            const statusConfig = getStatusBadge(account.status)
            const isBalanceVisible = visibleBalances[account.accountNumber]

            return (
              <motion.div
                key={account.accountNumber}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="overflow-hidden hover:border-neon-blue/50">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {account.type} Account
                        </h3>
                        <p className="text-sm text-white/60">
                          Acc: {maskAccountNumber(account.accountNumber)}
                        </p>
                      </div>
                      <Badge variant={statusConfig.variant}>
                        {statusConfig.label}
                      </Badge>
                    </div>

                    {/* Balance Section */}
                    <motion.div
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                      whileHover={{ borderColor: '#0ea5e9' }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-white/60 uppercase mb-1">Current Balance</p>
                          <p className="text-2xl font-bold gradient-text">
                            {isBalanceVisible 
                              ? formatCurrency(account.currentBalance)
                              : '●●●●●●'
                            }
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => toggleBalance(account.accountNumber)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          {isBalanceVisible ? (
                            <Eye size={20} className="text-neon-blue" />
                          ) : (
                            <EyeOff size={20} className="text-white/60" />
                          )}
                        </motion.button>
                      </div>
                    </motion.div>

                    {/* Account Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-white/60">Account Holder</p>
                        <p className="text-white font-semibold">{account.holderName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-white/60">Account Type</p>
                        <p className="text-white font-semibold">{account.type}</p>
                      </div>
                      <div>
                        <p className="text-white/60">IFSC Code</p>
                        <p className="text-white font-mono text-xs">{account.ifscCode || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-white/60">Opened On</p>
                        <p className="text-white">{formatDate(account.openedAt)}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedAccount(account.accountNumber)
                          loadMiniStatement(account.accountNumber)
                        }}
                        className="px-3 py-2 text-xs bg-white/10 hover:bg-neon-blue/20 rounded-lg text-white transition-all duration-300"
                      >
                        Mini Statement
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedAccount(account.accountNumber)
                          setShowStatement(true)
                        }}
                        className="px-3 py-2 text-xs bg-white/10 hover:bg-neon-blue/20 rounded-lg text-white transition-all duration-300"
                      >
                        Full Statement
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedAccount(account.accountNumber)
                          loadPassbook(account.accountNumber)
                        }}
                        className="px-3 py-2 text-xs bg-white/10 hover:bg-neon-blue/20 rounded-lg text-white transition-all duration-300"
                      >
                        Passbook
                      </motion.button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })
        )}
      </motion.div>

      {/* Mini Statement Modal */}
      <Modal
        isOpen={showMiniStatement}
        onClose={() => setShowMiniStatement(false)}
        title="Mini Statement"
        size="lg"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {statementData.length === 0 ? (
            <p className="text-white/60 text-center py-4">No transactions found</p>
          ) : (
            statementData.slice(0, 10).map((txn, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div>
                  <p className="text-white font-semibold text-sm">{txn.description}</p>
                  <p className="text-white/60 text-xs">{formatDate(txn.transactionDate)}</p>
                </div>
                <span className={`font-bold ${txn.type === 'DEBIT' ? 'text-red-400' : 'text-green-400'}`}>
                  {txn.type === 'DEBIT' ? '-' : '+'}{formatCurrency(txn.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Full Statement Modal */}
      <Modal
        isOpen={showStatement}
        onClose={() => setShowStatement(false)}
        title={`Full Statement - ${selectedAccount}`}
        size="lg"
      >
        <div className="space-y-4">
          {/* Date Filter */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="From"
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
            />
            <Input
              label="To"
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            onClick={() => selectedAccount && loadStatement(selectedAccount)}
          >
            <Download size={16} className="mr-2" />
            Download Statement
          </Button>

          {/* Transactions List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {statementData.length === 0 ? (
              <p className="text-white/60 text-center py-4">No transactions in this period</p>
            ) : (
              statementData.map((txn, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white/5 rounded-lg border border-white/10 text-sm"
                >
                  <div className="flex justify-between mb-1">
                    <span className="text-white font-semibold">{txn.description}</span>
                    <span className={`font-bold ${txn.type === 'DEBIT' ? 'text-red-400' : 'text-green-400'}`}>
                      {txn.type === 'DEBIT' ? '-' : '+'}{formatCurrency(txn.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-white/60 text-xs">
                    <span>{formatDate(txn.transactionDate)}</span>
                    <span>Ref: {txn.referenceNumber?.slice(0, 8)}...</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Passbook Modal */}
      <Modal
        isOpen={showPassbook}
        onClose={() => setShowPassbook(false)}
        title={`Passbook - ${selectedAccount}`}
        size="lg"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {statementData.length === 0 ? (
            <p className="text-white/60 text-center py-4">No passbook entries</p>
          ) : (
            <div className="space-y-2">
              {statementData.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 text-sm"
                >
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div>
                      <p className="text-white/60 text-xs">Date</p>
                      <p className="text-white font-semibold">{formatDate(entry.transactionDate)}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs">Description</p>
                      <p className="text-white">{entry.description?.substring(0, 15)}...</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs">Amount</p>
                      <p className={`font-bold ${entry.type === 'DEBIT' ? 'text-red-400' : 'text-green-400'}`}>
                        {entry.type === 'DEBIT' ? '-' : '+'}{formatCurrency(entry.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
