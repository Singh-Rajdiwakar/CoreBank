import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';

const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notifRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setNotificationCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchRecentNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await notificationAPI.getMyNotifications(0, 10);
      setNotifications(response.data?.data?.content || []);
    } catch (error) {
      console.error('Failed to fetch recent notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (notificationsOpen) {
      fetchRecentNotifications();
    }
  }, [notificationsOpen]);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifRef]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setNotificationCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setNotificationCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

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
        <div className="relative" ref={notifRef}>
          <button 
            className="relative p-2 hover:bg-gray-50 rounded-full transition-colors"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <span className="text-xl">🔔</span>
            {notificationCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold ring-2 ring-white shadow-sm"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </motion.span>
            )}
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 mt-3 w-[22rem] bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div>
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Alerts & Activity Inbox</p>
                  </div>
                  {notificationCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-[25rem] overflow-y-auto custom-scrollbar">
                  {loadingNotifications ? (
                    <div className="p-8 text-center space-y-3">
                      <div className="animate-spin text-2xl">⏳</div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50/30">
                      <span className="text-3xl opacity-50 mb-2 block">📭</span>
                      <p className="text-sm font-medium text-gray-900">You're all caught up!</p>
                      <p className="text-xs text-gray-500 mt-1">No new notifications here.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-50">
                      {notifications.map((notif) => (
                        <motion.li 
                          key={notif.id}
                          layout
                          className={`p-4 transition-colors relative cursor-pointer ${
                            notif.isRead ? 'bg-white hover:bg-gray-50/80' : 'bg-blue-50/40 hover:bg-blue-50'
                          }`}
                          onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                        >
                          <div className="flex gap-3">
                            <div className="mt-0.5 flex-shrink-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                notif.isRead ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600 shadow-sm'
                              }`}>
                                {notif.type === 'ALERT' ? '⚠️' : notif.type === 'PROMOTION' ? '🎉' : '🔔'}
                              </div>
                            </div>
                            <div className="flex-1 pr-6">
                              <p className={`text-sm ${notif.isRead ? 'text-gray-900' : 'text-gray-900 font-semibold'}`}>
                                {notif.message}
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          </div>
                          {!notif.isRead && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full shadow-sm shadow-blue-500/50" />
                          )}
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                  <button 
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                  >
                    Close Inbox
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
