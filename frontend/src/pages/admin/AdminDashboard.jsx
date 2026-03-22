import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LayoutDashboard, Building2, Users, BarChart3, Settings, Zap, Eye } from 'lucide-react'
import { Sidebar } from '../../components/layout/Sidebar'
import { Navbar } from '../../components/layout/Navbar'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { ProtectedRoute } from '../../components/layout/ProtectedRoute'
import AdminDashboardHome from './Dashboard'

export default function AdminDashboardPage() {
  const sidebarItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/branches', label: 'Branches', icon: Building2 },
    { path: '/admin/employees', label: 'Employees', icon: Users },
    { path: '/admin/customers', label: 'Customers', icon: Users },
    { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { path: '/admin/config', label: 'Config', icon: Settings },
    { path: '/admin/monitoring', label: 'Monitoring', icon: Zap },
  ]

  return (
    <ProtectedRoute requiredRole="ROLE_ADMIN">
      <DashboardLayout
        sidebar={<Sidebar items={sidebarItems} />}
        navbar={<Navbar title="Admin Dashboard" />}
      >
        <AdminDashboardHome />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
