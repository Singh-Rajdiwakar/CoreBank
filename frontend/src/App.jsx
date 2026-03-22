import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'

// Pages
import HomePage from './pages/Home/HomePage'
import LoginPage from './pages/Login/LoginPage'
import SignupPage from './pages/Signup/SignupPage'

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboard'
import BranchesPage from './pages/admin/Branches'
import EmployeesPage from './pages/admin/Employees'
import CustomersPage from './pages/admin/Customers'
import ReportsPage from './pages/admin/Reports'
import ConfigPage from './pages/admin/Config'
import MonitoringPage from './pages/admin/Monitoring'

// Manager Pages
import ManagerDashboardPage from './pages/manager/ManagerDashboard'
import ManagerTransfersPage from './pages/manager/ManagerTransfers'
import ManagerCustomersPage from './pages/manager/ManagerCustomers'

// Employee Pages
import EmployeeDashboardPage from './pages/employee/EmployeeDashboard'
import EmployeeCustomersPage from './pages/employee/EmployeeCustomers'
import EmployeeFraudPage from './pages/employee/EmployeeFraud'

// Auditor Pages
import AuditDashboardPage from './pages/auditor/AuditDashboard'
import AuditLogsPage from './pages/auditor/AuditLogs'

// Customer Pages
import CustomerDashboardPage from './pages/customer/CustomerDashboard'
import TransfersPage from './pages/customer/TransfersPage'
import AccountsPage from './pages/customer/AccountsPage'
import CardsPage from './pages/customer/CardsPage'
import DepositsPage from './pages/customer/DepositsPage'
import LoansPage from './pages/customer/LoansPage'
import DisputesPage from './pages/customer/DisputesPage'
import ProfilePage from './pages/customer/ProfilePage'
import BeneficiariesPage from './pages/customer/BeneficiariesPage'

import './index.css'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/branches" element={<BranchesPage />} />
            <Route path="/admin/employees" element={<EmployeesPage />} />
            <Route path="/admin/customers" element={<CustomersPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/config" element={<ConfigPage />} />
            <Route path="/admin/monitoring" element={<MonitoringPage />} />

            {/* Manager Routes */}
            <Route path="/manager/dashboard" element={<ManagerDashboardPage />} />
            <Route path="/manager/transfers" element={<ManagerTransfersPage />} />
            <Route path="/manager/customers" element={<ManagerCustomersPage />} />

            {/* Employee Routes */}
            <Route path="/employee/dashboard" element={<EmployeeDashboardPage />} />
            <Route path="/employee/customers" element={<EmployeeCustomersPage />} />
            <Route path="/employee/fraud" element={<EmployeeFraudPage />} />

            {/* Auditor Routes */}
            <Route path="/audit/dashboard" element={<AuditDashboardPage />} />
            <Route path="/audit/logs" element={<AuditLogsPage />} />

            {/* Customer Routes */}
            <Route path="/customer/dashboard" element={<CustomerDashboardPage />} />
            <Route path="/customer/transfers" element={<TransfersPage />} />
            <Route path="/customer/accounts" element={<AccountsPage />} />
            <Route path="/customer/cards" element={<CardsPage />} />
            <Route path="/customer/deposits" element={<DepositsPage />} />
            <Route path="/customer/loans" element={<LoansPage />} />
            <Route path="/customer/disputes" element={<DisputesPage />} />
            <Route path="/customer/profile" element={<ProfilePage />} />
            <Route path="/customer/beneficiaries" element={<BeneficiariesPage />} />

            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>

        <Toaster
          theme="dark"
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: 'rgba(10, 15, 30, 0.95)',
              border: '1px solid rgba(14, 165, 233, 0.5)',
              borderRadius: '12px',
              color: '#fff',
              backdropFilter: 'blur(16px)',
            },
          }}
        />
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
