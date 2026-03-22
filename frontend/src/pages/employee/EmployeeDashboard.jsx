import React from 'react'
import { LayoutDashboard, Users, AlertCircle } from 'lucide-react'
import { Sidebar } from '../../components/layout/Sidebar'
import { Navbar } from '../../components/layout/Navbar'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { ProtectedRoute } from '../../components/layout/ProtectedRoute'
import { motion } from 'framer-motion'
import { Card } from '../../components/common/Card'

export default function EmployeeDashboardPage() {
  const sidebarItems = [
    { path: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/employee/customers', label: 'My Customers', icon: Users },
    { path: '/employee/fraud', label: 'Fraud Cases', icon: AlertCircle },
  ]

  return (
    <ProtectedRoute requiredRole="ROLE_EMPLOYEE">
      <DashboardLayout
        sidebar={<Sidebar items={sidebarItems} />}
        navbar={<Navbar title="Employee Dashboard" />}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <Card>
            <p className="text-white/60 mb-2">Quick Stats</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-bold gradient-text">0</p>
                <p className="text-sm text-white/60">Assigned Customers</p>
              </div>
              <div>
                <p className="text-3xl font-bold gradient-text">0</p>
                <p className="text-sm text-white/60">Fraud Cases</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
