import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useAuth } from '../../context/AuthContext';

const sidebarItems = {
  admin: [
    { label: 'Dashboard', path: '/dashboard/admin', icon: '📊' },
    { label: 'Users', path: '/dashboard/admin/users', icon: '👥' },
    { label: 'Reports', path: '/dashboard/admin/reports', icon: '📈' },
    { label: 'Audit Logs', path: '/dashboard/admin/audit', icon: '🔍' },
    { label: 'Settings', path: '/dashboard/admin/settings', icon: '⚙️' },
  ],
  manager: [
    { label: 'Dashboard', path: '/dashboard/manager', icon: '📊' },
    { label: 'Employees', path: '/dashboard/manager/employees', icon: '👔' },
    { label: 'Teams', path: '/dashboard/manager/teams', icon: '👫' },
    { label: 'Reports', path: '/dashboard/manager/reports', icon: '📈' },
  ],
  employee: [
    { label: 'Dashboard', path: '/dashboard/employee', icon: '📊' },
    { label: 'Customers', path: '/dashboard/employee/customers', icon: '👥' },
    { label: 'Transactions', path: '/dashboard/employee/transactions', icon: '💳' },
  ],
  auditor: [
    { label: 'Dashboard', path: '/dashboard/auditor', icon: '📊' },
    { label: 'Audit Trail', path: '/dashboard/auditor/audit-trail', icon: '🔐' },
    { label: 'Compliance', path: '/dashboard/auditor/compliance', icon: '✅' },
    { label: 'Reports', path: '/dashboard/auditor/reports', icon: '📋' },
  ],
  customer: [
    { label: 'Dashboard', path: '/dashboard/customer', icon: '🏠' },
    { label: 'Accounts', path: '/dashboard/customer/accounts', icon: '💰' },
    { label: 'Transfer', path: '/dashboard/customer/transfer', icon: '📤' },
    { label: 'Loans', path: '/dashboard/customer/loans', icon: '🏦' },
    { label: 'Cards', path: '/dashboard/customer/cards', icon: '💳' },
    { label: 'Settings', path: '/dashboard/customer/settings', icon: '⚙️' },
  ],
};

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const linksRef = useRef([]);

  const items = sidebarItems[user?.role] || [];

  useEffect(() => {
    // GSAP stagger animation for sidebar links
    if (isOpen && linksRef.current.length > 0) {
      gsap.fromTo(
        linksRef.current,
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
        }
      );
    }
  }, [isOpen]);

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: isOpen ? 0 : -250 }}
      transition={{ duration: 0.3 }}
      className="w-64 bg-white border-r border-gray-100 shadow-elegant-sm flex flex-col fixed h-screen z-50 md:relative md:z-0"
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-blue-600">NexPay</h1>
        <p className="text-xs text-gray-500 mt-1">{user?.role?.toUpperCase()}</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item, idx) => (
          <Link
            key={item.path}
            ref={(el) => (linksRef.current[idx] = el)}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 ${
              location.pathname === item.path
                ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-sm font-medium hover:bg-red-100 transition-colors duration-300 text-sm"
        >
          Logout
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
