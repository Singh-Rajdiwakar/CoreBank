import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useEffect, useState } from 'react';

// Normalize role: strip 'role_' prefix and convert to lowercase
const normalizeRole = (role) => {
  if (typeof role === 'string') {
    return role.replace(/^role_/i, '').toLowerCase();
  }
  if (typeof role === 'object' && role.name) {
    return role.name.replace(/^role_/i, '').toLowerCase();
  }
  if (typeof role === 'object' && role.authority) {
    return role.authority.replace(/^role_/i, '').toLowerCase();
  }
  return String(role).replace(/^role_/i, '').toLowerCase();
};

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const user = useStore((state) => state.user);
  const loading = useStore((state) => state.loading);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const info = {
      isAuthenticated,
      loading,
      userExists: !!user,
      user: user ? { id: user.id, username: user.username, roles: user.roles } : null,
      allowedRoles,
      hasRequiredRole: user?.roles ? user.roles.some((role) => {
        const normalizedRole = normalizeRole(role);
        const allowed = allowedRoles.includes(normalizedRole);
        console.log(`Checking role: "${role}" (normalized: "${normalizedRole}") against allowed: ${allowedRoles} = ${allowed}`);
        return allowed;
      }) : false,
    };

    console.log('🔐 ProtectedRoute Debug:', info);
    setDebugInfo(JSON.stringify(info, null, 2));
  }, [isAuthenticated, user, loading, allowedRoles]);

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading authentication...</p>
          <p className="text-xs text-gray-400 mt-4">⏳ Please wait...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    console.warn('❌ Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // Check roles if required
  if (allowedRoles.length > 0 && user?.roles) {
    const hasRole = user.roles.some((role) => {
      const normalizedRole = normalizeRole(role);
      return allowedRoles.includes(normalizedRole);
    });

    if (!hasRole) {
      console.warn('❌ User role not allowed. User roles:', user.roles, 'Allowed:', allowedRoles);
      console.warn('📋 Debug Info:', debugInfo);
      return <Navigate to="/" replace />;
    }
  }

  console.log('✅ Access granted to protected route');
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
