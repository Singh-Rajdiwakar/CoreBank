import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';

const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoadingNotifications(true);
      try {
        const response = await adminAPI.getNotifications();
        setNotificationCount(response.data.unreadCount || 0);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
      setLoadingNotifications(false);
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const breadcrumbs = window.location.pathname.split('/').filter(Boolean);

  return (
    <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between shadow-elegant-sm">
      {/* Left: Menu & Breadcrumb */}
      <div className="flex items-center gap-6">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-50 rounded-sm transition-colors md:hidden"
        >
          ☰
        </button>
        <div className="text-sm text-gray-600">
          {breadcrumbs.length > 0 ? (
            breadcrumbs.map((item, idx) => (
              <span key={idx}>
                {idx > 0 && ' / '}
                <span className="capitalize">{item}</span>
              </span>
            ))
          ) : (
            <span>Dashboard</span>
          )}
        </div>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications Bell */}
        <div className="relative">
          <button className="relative p-2 hover:bg-gray-50 rounded-sm transition-colors">
            🔔
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <motion.button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-sm transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-sm font-medium">{user?.name || 'User'}</span>
            <span className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-sm shadow-elegant-md z-50"
              >
                <div className="p-3 border-b border-gray-100 text-xs text-gray-600">
                  <p className="font-semibold">{user?.name}</p>
                  <p>{user?.email}</p>
                </div>
                <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm transition-colors">
                  Profile Settings
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm transition-colors">
                  Security
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
