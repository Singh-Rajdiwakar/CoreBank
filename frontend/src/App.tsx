import { Route, Routes } from 'react-router-dom'

import { RequireAuth } from './routes/RequireAuth'
import { RequireRole } from './routes/RequireRole'

import Landing from './pages/Landing'
import NotFound from './pages/NotFound'
import LoginPage from './pages/auth/Login'
import RegisterPage from './pages/auth/Register'
import CustomerLayout from './pages/customer/CustomerLayout'
import CustomerAccountsPage from './pages/customer/Accounts'
import CustomerDashboardPage from './pages/customer/Dashboard'
import CustomerNotificationsPage from './pages/customer/Notifications'
import CustomerTransfersPage from './pages/customer/Transfers'
import CustomerProfilePage from './pages/customer/Profile'
import CustomerTransactionPinPage from './pages/customer/TransactionPin'
import CustomerDepositsPage from './pages/customer/Deposits'
import CustomerWithdrawalsPage from './pages/customer/Withdrawals'
import CustomerBeneficiariesPage from './pages/customer/Beneficiaries'
import CustomerCardsPage from './pages/customer/Cards'
import CustomerLoansPage from './pages/customer/Loans'
import CustomerFDPage from './pages/customer/FD'
import CustomerRDPage from './pages/customer/RD'
import CustomerTransactionHistoryPage from './pages/customer/TransactionHistory'
import CustomerDisputesPage from './pages/customer/Disputes'
import AccountStatementPage from './pages/customer/AccountStatement'
import BulkTransferPage from './pages/customer/BulkTransfer'
import DocumentsPage from './pages/customer/Documents'
import CardTransactionsPage from './pages/customer/CardTransactions'
import SpendingOverviewPage from './pages/customer/SpendingOverview'
import OpsLayout from './pages/ops/OpsLayout'
import OpsDashboardPage from './pages/ops/Dashboard'
import OpsApprovalsTransfersPage from './pages/ops/ApprovalsTransfers'
import OpsFraudCasesPage from './pages/ops/FraudCases'
import OpsAuditLogsPage from './pages/ops/AuditLogs'
import OpsReportsPage from './pages/ops/Reports'
import OpsBranchesPage from './pages/ops/Branches'
import OpsNotificationsAdminPage from './pages/ops/NotificationsAdmin'
import OpsDisputesPage from './pages/ops/Disputes'
import OpsCustomersPage from './pages/ops/Customers'
import OpsMonitoringPage from './pages/ops/Monitoring'
import OpenAccountForm from './pages/ops/OpenAccountForm'
import EmployeesPage from './pages/ops/Employees'
import AdminConfigPage from './pages/ops/AdminConfig'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/app"
        element={
          <RequireAuth>
            <RequireRole anyOf={['ROLE_CUSTOMER']}>
              <CustomerLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<CustomerDashboardPage />} />
        <Route path="accounts" element={<CustomerAccountsPage />} />
        <Route path="transfers" element={<CustomerTransfersPage />} />
        <Route path="deposits" element={<CustomerDepositsPage />} />
        <Route path="withdrawals" element={<CustomerWithdrawalsPage />} />
        <Route path="beneficiaries" element={<CustomerBeneficiariesPage />} />
        <Route path="cards" element={<CustomerCardsPage />} />
        <Route path="loans" element={<CustomerLoansPage />} />
        <Route path="fd" element={<CustomerFDPage />} />
        <Route path="rd" element={<CustomerRDPage />} />
        <Route path="transactions" element={<CustomerTransactionHistoryPage />} />
        <Route path="disputes" element={<CustomerDisputesPage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
        <Route path="transaction-pin" element={<CustomerTransactionPinPage />} />
        <Route path="notifications" element={<CustomerNotificationsPage />} />
        <Route path="statement" element={<AccountStatementPage />} />
        <Route path="bulk-transfer" element={<BulkTransferPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="card-transactions" element={<CardTransactionsPage />} />
        <Route path="spending-overview" element={<SpendingOverviewPage />} />
      </Route>

      <Route
        path="/ops"
        element={
          <RequireAuth>
            <RequireRole
              anyOf={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_EMPLOYEE', 'ROLE_AUDITOR']}
            >
              <OpsLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route index element={<OpsDashboardPage />} />

        <Route
          path="approvals/transfers"
          element={
            <RequireRole anyOf={['ROLE_ADMIN', 'ROLE_MANAGER']}>
              <OpsApprovalsTransfersPage />
            </RequireRole>
          }
        />

        <Route
          path="fraud"
          element={
            <RequireRole anyOf={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_EMPLOYEE', 'ROLE_AUDITOR']}>
              <OpsFraudCasesPage />
            </RequireRole>
          }
        />

        <Route
          path="disputes"
          element={
            <RequireRole anyOf={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_EMPLOYEE', 'ROLE_AUDITOR']}>
              <OpsDisputesPage />
            </RequireRole>
          }
        />

        <Route
          path="customers"
          element={
            <RequireRole anyOf={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_EMPLOYEE']}>
              <OpsCustomersPage />
            </RequireRole>
          }
        />

        <Route
          path="accounts/open"
          element={
            <RequireRole anyOf={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_EMPLOYEE']}>
              <OpenAccountForm />
            </RequireRole>
          }
        />

        <Route
          path="audit"
          element={
            <RequireRole anyOf={['ROLE_ADMIN', 'ROLE_AUDITOR']}>
              <OpsAuditLogsPage />
            </RequireRole>
          }
        />

        <Route
          path="reports"
          element={
            <RequireRole anyOf={['ROLE_ADMIN', 'ROLE_AUDITOR']}>
              <OpsReportsPage />
            </RequireRole>
          }
        />

        <Route
          path="branches"
          element={
            <RequireRole anyOf={['ROLE_ADMIN']}>
              <OpsBranchesPage />
            </RequireRole>
          }
        />

        <Route
          path="notifications"
          element={
            <RequireRole anyOf={['ROLE_ADMIN']}>
              <OpsNotificationsAdminPage />
            </RequireRole>
          }
        />

        <Route
          path="monitoring"
          element={
            <RequireRole anyOf={['ROLE_ADMIN']}>
              <OpsMonitoringPage />
            </RequireRole>
          }
        />

        <Route
          path="employees"
          element={
            <RequireRole anyOf={['ROLE_ADMIN']}>
              <EmployeesPage />
            </RequireRole>
          }
        />

        <Route
          path="config"
          element={
            <RequireRole anyOf={['ROLE_ADMIN']}>
              <AdminConfigPage />
            </RequireRole>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
