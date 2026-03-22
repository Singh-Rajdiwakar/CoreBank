import React, { useState } from 'react'
import { LayoutDashboard, FileText } from 'lucide-react'
import { Sidebar } from '../../components/layout/Sidebar'
import { Navbar } from '../../components/layout/Navbar'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { ProtectedRoute } from '../../components/layout/ProtectedRoute'
import { motion } from 'framer-motion'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'

export default function AuditDashboardPage() {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  const sidebarItems = [
    { path: '/audit/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/audit/logs', label: 'Audit Logs', icon: FileText },
  ]

  const handleFetchLogs = async () => {
    setLoading(true)
    // API call would go here
    setLoading(false)
  }

  return (
    <ProtectedRoute requiredRole="ROLE_AUDITOR">
      <DashboardLayout
        sidebar={<Sidebar items={sidebarItems} />}
        navbar={<Navbar title="Auditor Dashboard" />}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <Card>
            <h2 className="text-xl font-semibold mb-6 gradient-text">Audit Logs</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Input
                label="From Date"
                type="datetime-local"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <Input
                label="To Date"
                type="datetime-local"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <Button
              onClick={handleFetchLogs}
              loading={loading}
              className="w-full"
            >
              Fetch Logs
            </Button>

            {logs.length === 0 && (
              <div className="mt-8 text-center py-12 text-white/60">
                No audit logs to display
              </div>
            )}
          </Card>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
