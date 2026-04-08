import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../store/useStore';
import { 
  LayoutDashboard, Building2, Users, ShieldAlert, Settings, PieChart, Info, 
  CheckSquare, Banknote, FileTerminal, CreditCard, PiggyBank, Briefcase, HandCoins, AlertTriangle, ArrowRightLeft, ScrollText, AlertCircle, FileDigit
} from 'lucide-react';

const sidebarItems = {
  admin: [
    { label: 'Dashboard', path: '/dashboard/admin', icon: <LayoutDashboard size={20} /> },
    { label: 'Branch Management', path: '/dashboard/admin/branches', icon: <Building2 size={20} /> },
    { label: 'Employee Setup', path: '/dashboard/admin/employees', icon: <Users size={20} /> },
    { label: 'Customer Moderation', path: '/dashboard/admin/customers', icon: <ShieldAlert size={20} /> },
    { label: 'System Config & Fees', path: '/dashboard/admin/config', icon: <Settings size={20} /> },
    { label: 'Advanced Reports', path: '/dashboard/admin/reports', icon: <PieChart size={20} /> },
    { label: 'System Health & Logs', path: '/dashboard/admin/health', icon: <Info size={20} /> },
  ],
  manager: [
    { label: 'Approvals Queue', path: '/dashboard/manager/approvals', icon: <CheckSquare size={20} /> },
    { label: 'Loan Processing', path: '/dashboard/manager/loans', icon: <Banknote size={20} /> },
  ],
  employee: [
    { label: 'My Customers', path: '/dashboard/employee/customers', icon: <Users size={20} /> },
    { label: 'Teller Desk', path: '/dashboard/employee/teller', icon: <FileTerminal size={20} /> },
    { label: 'Fraud Review', path: '/dashboard/employee/fraud', icon: <AlertCircle size={20} /> },
    { label: 'Dispute Resolution', path: '/dashboard/employee/disputes', icon: <AlertTriangle size={20} /> },
  ],
  auditor: [
    { label: 'Audit Logs', path: '/dashboard/auditor/logs', icon: <ScrollText size={20} /> },
  ],
  customer: [
    { label: 'Dashboard', path: '/dashboard/customer', icon: <LayoutDashboard size={20} /> },
    { label: 'Fund Transfer', path: '/dashboard/customer/transfer', icon: <ArrowRightLeft size={20} /> },
    { label: 'Transaction History', path: '/dashboard/customer/history', icon: <FileDigit size={20} /> },
    { label: 'Cards Management', path: '/dashboard/customer/cards', icon: <CreditCard size={20} /> },
    { label: 'FDs & RDs', path: '/dashboard/customer/deposits', icon: <PiggyBank size={20} /> },
    { label: 'Loans', path: '/dashboard/customer/loans', icon: <HandCoins size={20} /> },
    { label: 'Dispute Center', path: '/dashboard/customer/disputes', icon: <AlertTriangle size={20} /> },
    { label: 'Profile & KYC', path: '/dashboard/customer/profile', icon: <Briefcase size={20} /> },
  ],
};

// Normalize role: strip 'role_' prefix and convert to lowercase
const normalizeUserRole = (roleArray) => {
  if (!roleArray || !roleArray.length) return '';
  const rawRole = roleArray[0];
  let roleStr = '';
  if (typeof rawRole === 'string') roleStr = rawRole;
  else if (typeof rawRole === 'object' && rawRole.name) roleStr = rawRole.name;
  else if (typeof rawRole === 'object' && rawRole.authority) roleStr = rawRole.authority;
  else roleStr = String(rawRole);
  
  return roleStr.replace(/^role_/i, '').toLowerCase();
};

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const authContextUser = useAuth().user;
  const storeUser = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const linksRef = useRef([]);

  // Use Zustand user if available, otherwise context user
  const activeUser = storeUser || authContextUser;
  const normalizedRole = normalizeUserRole(activeUser?.roles || [activeUser?.role]);
  const items = sidebarItems[normalizedRole] || [];

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
      <div className="p-6 border-b border-gray-100 flex-shrink-0">
        <h1 className="text-2xl font-bold text-blue-600">NexPay</h1>
        <p className="text-xs text-gray-500 mt-1 uppercase font-semibold">{normalizedRole}</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {items.map((item, idx) => (
          <NavLink
            key={item.path}
            ref={(el) => (linksRef.current[idx] = el)}
            to={item.path}
            end={item.path === `/dashboard/${normalizedRole}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-semibold shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-500 font-medium'
              }`
            }
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="text-sm tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100 mt-auto">
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
