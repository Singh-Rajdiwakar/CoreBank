import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import CustomCursor from './components/common/CustomCursor';
import PageTransitionWrapper from './components/common/PageTransitionWrapper';
import ProtectedRoute from './components/routing/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';

// Admin Dashboard
import AdminOverview from './pages/dashboard/admin/AdminOverview';

// Customer Dashboard
import CustomerOverview from './pages/dashboard/customer/CustomerOverview';

// Placeholder pages
const ManagerDash = () => (
  <DashboardLayout>
    <div><h1 className="text-4xl font-bold">Manager Dashboard</h1><p className="text-gray-600 mt-4">Coming soon...</p></div>
  </DashboardLayout>
);

const EmployeeDash = () => (
  <DashboardLayout>
    <div><h1 className="text-4xl font-bold">Employee Dashboard</h1><p className="text-gray-600 mt-4">Coming soon...</p></div>
  </DashboardLayout>
);

const AuditorDash = () => (
  <DashboardLayout>
    <div><h1 className="text-4xl font-bold">Auditor Dashboard</h1><p className="text-gray-600 mt-4">Coming soon...</p></div>
  </DashboardLayout>
);

function AppRoutes() {
  const location = window.location.pathname;

  return (
    <PageTransitionWrapper location={location}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/dashboard/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout><Routes><Route index element={<AdminOverview />} /><Route path="users" element={<div className="p-4">Users</div>} /><Route path="*" element={<Navigate to="./" />} /></Routes></DashboardLayout></ProtectedRoute>} />

        <Route path="/dashboard/manager/*" element={<ProtectedRoute allowedRoles={['manager']}><ManagerDash /></ProtectedRoute>} />

        <Route path="/dashboard/employee/*" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDash /></ProtectedRoute>} />

        <Route path="/dashboard/auditor/*" element={<ProtectedRoute allowedRoles={['auditor']}><AuditorDash /></ProtectedRoute>} />

        <Route path="/dashboard/customer/*" element={<ProtectedRoute allowedRoles={['customer']}><DashboardLayout><Routes><Route index element={<CustomerOverview />} /><Route path="*" element={<Navigate to="./" />} /></Routes></DashboardLayout></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </PageTransitionWrapper>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <CustomCursor />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
