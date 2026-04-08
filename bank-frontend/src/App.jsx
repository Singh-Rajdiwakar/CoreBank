import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { AuthProvider } from './context/AuthContext';
import CustomCursor from './components/common/CustomCursor';
import PageTransitionWrapper from './components/common/PageTransitionWrapper';
import ProtectedRoute from './components/routing/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import ErrorBoundary from './components/common/ErrorBoundary';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';

// Admin Dashboard
import AdminOverview from './pages/dashboard/admin/AdminOverview';
import AdminBranches from './pages/dashboard/admin/AdminBranches';
import AdminUsers from './pages/dashboard/admin/AdminUsers';
import AdminConfig from './pages/dashboard/admin/AdminConfig';
import AdminSystemHealth from './pages/dashboard/admin/AdminSystemHealth';
import AdminFinancialReports from './pages/dashboard/admin/AdminFinancialReports';

// Manager Dashboard
import ManagerApprovals from './pages/dashboard/manager/ManagerApprovals';
import ManagerLoans from './pages/dashboard/manager/ManagerLoans';

// Customer Dashboard
import CustomerOverview from './pages/dashboard/customer/CustomerOverview';
import FundTransfer from './pages/dashboard/customer/FundTransfer';
import TransactionHistory from './pages/dashboard/customer/TransactionHistory';
import DepositsDashboard from './pages/dashboard/customer/DepositsDashboard';
import LoansDashboard from './pages/dashboard/customer/LoansDashboard';
import CardManagement from './pages/dashboard/customer/CardManagement';
import SpendingAnalytics from './pages/dashboard/customer/SpendingAnalytics';
import DisputeCenter from './pages/dashboard/customer/DisputeCenter';
import SettingsDashboard from './pages/dashboard/customer/SettingsDashboard';
import CustomerCorporate from './pages/dashboard/customer/CustomerCorporate';

// Employee Dashboard
import EmployeeOperations from './pages/dashboard/employee/EmployeeOperations';
import EmployeeDisputes from './pages/dashboard/employee/EmployeeDisputes';
import EmployeeTeller from './pages/dashboard/employee/EmployeeTeller';

// Auditor Dashboard
import AuditorAuditLogs from './pages/dashboard/auditor/AuditorAuditLogs';

// Placeholder pages
const ManagerDash = () => (
  <DashboardLayout>
    <div><h1 className="text-4xl font-bold">Manager Dashboard</h1><p className="text-gray-600 mt-4">Coming soon...</p></div>
  </DashboardLayout>
);

function AppRoutes() {
  const location = window.location.pathname;

  return (
    <PageTransitionWrapper location={location}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route path="/dashboard/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><Routes><Route index element={<AdminOverview />} /><Route path="branches" element={<AdminBranches />} /><Route path="staff" element={<div className="p-4">Staff Directory</div>} /><Route path="users" element={<AdminUsers />} /><Route path="config" element={<AdminConfig />} /><Route path="health" element={<AdminSystemHealth />} /><Route path="reports" element={<AdminFinancialReports />} /><Route path="*" element={<Navigate to="./" />} /></Routes></DashboardLayout></ProtectedRoute>} />

        <Route path="/dashboard/manager/*" element={<ProtectedRoute allowedRoles={['manager']}><DashboardLayout><Routes>
          <Route index element={<Navigate to="approvals" />} />
          <Route path="approvals" element={<ManagerApprovals />} />
          <Route path="loans" element={<ManagerLoans />} />
          <Route path="*" element={<Navigate to="approvals" />} />
        </Routes></DashboardLayout></ProtectedRoute>} />

<Route path="/dashboard/employee/*" element={
          <ProtectedRoute allowedRoles={['employee']}>
            <DashboardLayout>
              <Routes>
                <Route index element={<Navigate to="operations" replace />} />
                <Route path="operations" element={<EmployeeOperations />} />
                <Route path="disputes" element={<EmployeeDisputes />} />
                <Route path="teller" element={<EmployeeTeller />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/auditor/*" element={
          <ProtectedRoute allowedRoles={['auditor']}>
            <DashboardLayout>
              <Routes>
                <Route index element={<Navigate to="logs" replace />} />
                <Route path="logs" element={<AuditorAuditLogs />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/customer/*" element={<ProtectedRoute allowedRoles={['customer']}><DashboardLayout><Routes>
          <Route index element={<CustomerOverview />} />
          <Route path="transfer" element={<FundTransfer />} />
          <Route path="transactions" element={<TransactionHistory />} />
          <Route path="deposits" element={<DepositsDashboard />} />
          <Route path="loans" element={<LoansDashboard />} />
          <Route path="cards" element={<CardManagement />} />
          <Route path="analytics" element={<SpendingAnalytics />} />
          <Route path="disputes" element={<DisputeCenter />} />
          <Route path="corporate" element={<CustomerCorporate />} />
          <Route path="settings" element={<SettingsDashboard />} />
          <Route path="*" element={<Navigate to="./" />} />
        </Routes></DashboardLayout></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </PageTransitionWrapper>
  );
}

function App() {
  // Initialize auth state from localStorage on app load
  useEffect(() => {
    useStore.getState().hydrate();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <CustomCursor />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
