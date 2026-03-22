import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart4, Users, AlertTriangle, Lock } from 'lucide-react'
import { adminAPI } from '../../services/endpoints/admin'
import { Card } from '../../components/common/Card'
import { Skeleton } from '../../components/common/Loading'
import { Badge } from '../../components/common/Badge'
import { formatCurrency, formatDate } from '../../utils/formatting'
import { BarChart, LineChartComponent, PieChartComponent } from '../../components/charts/Charts'
import { toast } from 'sonner'

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [dailyVolume, setDailyVolume] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashData, volumeData] = await Promise.all([
          adminAPI.getDashboard(),
          adminAPI.getDailyVolume(),
        ])
        setDashboard(dashData.data)
        setDailyVolume(volumeData.data)
      } catch (error) {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} count={3} height={20} className="p-6" />
        ))}
      </div>
    )
  }

  const metrics = [
    { label: 'Total Customers', value: dashboard?.totalCustomers || 0, icon: Users, color: 'blue' },
    { label: 'Active Accounts', value: dashboard?.activeAccounts || 0, icon: Lock, color: 'green' },
    { label: 'Fraud Flagged', value: dashboard?.fraudFlaggedCount || 0, icon: AlertTriangle, color: 'red' },
    { label: 'Dormant Accounts', value: dashboard?.dormantAccounts || 0, icon: BarChart4, color: 'amber' },
  ]

  return (
    <div className="space-y-8">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon
          const colorMap = {
            blue: 'border-neon-blue',
            green: 'border-green-500',
            red: 'border-red-500',
            amber: 'border-amber-500',
          }

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`glass rounded-xl p-6 border-t-2 ${colorMap[metric.color]}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-2">{metric.label}</p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-3xl font-bold gradient-text"
                  >
                    {metric.value.toLocaleString()}
                  </motion.p>
                </div>
                <Icon className="text-neon-blue/60" size={32} />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts */}
      {dailyVolume && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold mb-6 gradient-text">Daily Transaction Volume</h2>
          <LineChartComponent
            data={dailyVolume.dailyData || []}
            xKey="date"
            yKeys={['transactions', 'amount']}
          />
        </motion.div>
      )}

      {/* High Value Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold mb-6 gradient-text">High-Value Transactions</h2>
        <div className="space-y-4">
          {dashboard?.highValueTransactions?.slice(0, 5).map((txn, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <p className="font-semibold text-white">{txn.description}</p>
                <p className="text-sm text-white/60">{formatDate(txn.date)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-400">{formatCurrency(txn.amount)}</p>
                <Badge variant="success" size="sm">{txn.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
