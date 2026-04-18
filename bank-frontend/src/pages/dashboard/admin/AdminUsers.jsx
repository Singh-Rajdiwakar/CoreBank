import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../../../services/api';
import Toast from '../../../components/common/Toast';
import CustomerCreateModal from './CustomerCreateModal';
import AccountCreateModal from './AccountCreateModal';

const AdminUsers = () => {
  const [activeTab, setActiveTab] = useState('CUSTOMERS');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [selectedCustomerForAccount, setSelectedCustomerForAccount] = useState(null);
  
  // Customers State
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Block Modal State
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [targetCustomer, setTargetCustomer] = useState(null);
  const [blockRemarks, setBlockRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Locked Users State
  const [lockedUsers, setLockedUsers] = useState([]);
  const [loadingLocked, setLoadingLocked] = useState(false);

  useEffect(() => {
    if (activeTab === 'CUSTOMERS') {
      fetchCustomers();
    } else if (activeTab === 'LOCKED_USERS') {
      fetchLockedUsers();
    }
  }, [activeTab]);

  const showNotification = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getCustomers();
      const cx = response.data; setCustomers(Array.isArray(cx) ? cx : (Array.isArray(cx?.data) ? cx.data : (cx?.data?.content || [])));
    } catch (error) {
      console.error('Failed to fetch customers', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLockedUsers = async () => {
    setLoadingLocked(true);
    try {
      // Mocking / fallback if the endpoint doesn't return properly
      const response = await adminAPI.getLockedUsers().catch(() => ({ data: [] }));
      const lx = response.data; setLockedUsers(Array.isArray(lx) ? lx : (Array.isArray(lx?.data) ? lx.data : (lx?.data?.content || [])));
    } catch (error) {
      console.error('Failed to fetch locked users', error);
    } finally {
      setLoadingLocked(false);
    }
  };

  // Filtered list
  const filteredCustomers = customers.filter(c => 
      String(c.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      String(c.customerCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(c.name || c.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  const handleToggleBlock = async (customer) => {
    if (customer.status === 'BLACKLISTED') {
      // Unblock immediately
      const unblockReason = prompt("Please provide a reason to unblock this user:");
      if (unblockReason === null) return; // User cancelled

      setIsUpdating(true);
      try {
        await adminAPI.unblockCustomer(customer.id, unblockReason || "Unblocked by admin");
        const updated = customers.map(c => c.id === customer.id ? { ...c, status: 'ACTIVE' } : c);
        setCustomers(updated);
        showNotification('Customer unblocked successfully.', 'success');
      } catch (error) {
        showNotification('Failed to unblock customer.', 'error');
      } finally {
        setIsUpdating(false);
      }
    } else {
      // Open block modal
      setTargetCustomer(customer);
      setBlockRemarks('');
      setShowBlockModal(true);
    }
  };

  const handleArchiveCustomer = async (customer) => {
      if (!window.confirm(`Are you sure you want to permanently archive ${customer.name || customer.fullName || 'this customer'}? This action cannot be undone.`)) return;
    setIsUpdating(true);
    try {
      await adminAPI.archiveCustomer(customer.id);
      showNotification('Customer archived successfully', 'success');
      fetchCustomers();
    } catch (err) {
      showNotification('Failed to archive customer.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnarchiveCustomer = async (customer) => {
    if (!window.confirm(`Are you sure you want to reactivate ${customer.name || customer.fullName || 'this customer'}?`)) return;
    setIsUpdating(true);
    try {
      await adminAPI.unarchiveCustomer(customer.id);
      showNotification('Customer reactivated successfully', 'success');
      fetchCustomers();
    } catch (err) {
      showNotification('Failed to reactivate customer.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmBlockCustomer = async (e) => {
    e.preventDefault();
    if (!blockRemarks.trim()) {
      showNotification('Remarks are required to block a customer.', 'error');
      return;
    }

    setIsUpdating(true);
    try {
      await adminAPI.blockCustomer(targetCustomer.id, blockRemarks);
      const updated = customers.map(c => c.id === targetCustomer.id ? { ...c, status: 'BLACKLISTED' } : c);
      setCustomers(updated);
      setShowBlockModal(false);
      showNotification('Customer successfully blocked.', 'success');
    } catch (error) {
      showNotification('Failed to block customer.', 'error');
    } finally {
      setIsUpdating(false);
      setTargetCustomer(null);
    }
  };

  const handleUnlockUser = async (userId) => {
    setIsUpdating(true);
    try {
      await adminAPI.unlockUser(userId);
      setLockedUsers(lockedUsers.filter(u => u.id !== userId));
      showNotification('User account unlocked successfully.', 'success');
    } catch (error) {
      showNotification('Failed to unlock user.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <AnimatePresence>
        {toast.show && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Security & Moderation</h1>
        <p className="text-gray-500 mt-1">Manage global customer access and resolve locked accounts.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 space-x-8">
        <button
          className={`pb-4 font-medium transition-colors relative ${activeTab === 'CUSTOMERS' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('CUSTOMERS')}
        >
          Customer Roster
          {activeTab === 'CUSTOMERS' && (
            <motion.div layoutId="activeTabBadge" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
          )}
        </button>
        <button
          className={`pb-4 font-medium transition-colors relative flex items-center space-x-2 ${activeTab === 'LOCKED_USERS' ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('LOCKED_USERS')}
        >
          <span>Locked Accounts</span>
          {lockedUsers.length > 0 && activeTab !== 'LOCKED_USERS' && (
            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">
              {lockedUsers.length}
            </span>
          )}
          {activeTab === 'LOCKED_USERS' && (
            <motion.div layoutId="activeTabBadge" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-t-full" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
        
        {/* CUSTOMERS TAB */}
        {activeTab === 'CUSTOMERS' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Search Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search by ID, Name or Email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>New Customer</span>
                  </span>
                </button>
                <button onClick={fetchCustomers} className="text-gray-400 hover:text-blue-600 transition-colors" title="Refresh list">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Customers Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Info</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Loading customers...</td></tr>
                  ) : filteredCustomers.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">No matching customers found.</td></tr>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <tr key={customer.id} className={`hover:bg-gray-50 transition-colors ${customer.status === 'BLACKLISTED' ? 'bg-red-50/20' : ''}`}>
                        <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{customer.name || customer.fullName}</div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm tracking-wider text-gray-600">{customer.customerCode || customer.id || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            customer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {customer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-4 justify-end items-center">
                          {/* Toggle Switch */}
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] uppercase text-gray-500 font-bold">{customer.status === 'BLACKLISTED' ? 'Unblock' : 'Block'}</span>
                            <button
                              disabled={isUpdating}
                              onClick={() => handleToggleBlock(customer)}
                              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors outline-none disabled:opacity-50
                                ${customer.status === 'BLACKLISTED' ? 'bg-red-600' : 'bg-green-500'}`}
                            >
                              <span 
                                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                    customer.status === 'BLACKLISTED' ? 'translate-x-1' : 'translate-x-6'
                                }`} 
                              />
                            </button>
                          </div>
                                                      {/* Open Account Button */}
                            <button
                              title="Open New Account"
                              disabled={isUpdating}
                              onClick={() => {
                                setSelectedCustomerForAccount(customer);
                                setShowAccountModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="16"></line>
                                <line x1="8" y1="12" x2="16" y2="12"></line>
                              </svg>
                            </button>
                          {/* Archive/Unarchive Button */}
                          {customer.status === 'ARCHIVED' ? (
                            <button
                              title="Reactivate Customer"
                              disabled={isUpdating}
                              onClick={() => handleUnarchiveCustomer(customer)}
                              className="p-2 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors disabled:opacity-50"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            </button>
                          ) : (
                            <button
                              title="Globally Archive Customer"
                              disabled={isUpdating}
                              onClick={() => handleArchiveCustomer(customer)}
                              className="p-2 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* LOCKED USERS TAB */}
        {activeTab === 'LOCKED_USERS' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Brute Force / Security Locks</h2>
              <button onClick={fetchLockedUsers} className="text-gray-400 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-6 text-sm text-orange-800 flex items-start gap-3">
               <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
               <p>
                 Users listed below have been automatically locked out of the banking system due to excessive failed login attempts. Verify their identity before issuing an unlock.
               </p>
            </div>

            <div className="grid gap-4">
              {loadingLocked ? (
                <div className="text-center py-8 text-gray-500">Loading locked accounts...</div>
              ) : lockedUsers.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl">
                  <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Clear Horizon</h3>
                  <p className="text-gray-500">There are no locked accounts in the system.</p>
                </div>
              ) : (
                lockedUsers.map(user => (
                  <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-red-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                     <div className="flex gap-4 items-center mb-4 sm:mb-0">
                       <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center border border-red-200 shadow-sm flex-shrink-0">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                       </div>
                       <div>
                         <p className="font-bold text-gray-900">{user.username}</p>
                         <p className="text-sm text-gray-500">{user.email} • ID: <span className="font-mono">{user.id}</span></p>
                         <p className="text-xs font-semibold text-red-600 mt-1">{user.failedAttempts} failed login attempts</p>
                       </div>
                     </div>
                     <button
                       onClick={() => handleUnlockUser(user.id)}
                       disabled={isUpdating}
                       className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors shadow-sm"
                     >
                       Unlock Account
                     </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Block Confirmation Modal */}
      <AnimatePresence>
        {showBlockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4 border border-red-200">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Block Customer Profile</h3>
              <p className="text-gray-500 text-sm mb-6">
                You are about to sever access for <span className="font-semibold text-gray-800">{targetCustomer?.name}</span>. This will immediately freeze all connected accounts and prevent future logins.
              </p>

              <form onSubmit={confirmBlockCustomer}>
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Formal Remarks / Reason
                  </label>
                  <textarea
                    required
                    value={blockRemarks}
                    onChange={(e) => setBlockRemarks(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-sm resize-none"
                    placeholder="e.g. KYC violation detected, fraud evidence attached..."
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowBlockModal(false)}
                    disabled={isUpdating}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating || !blockRemarks.trim()}
                    className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {isUpdating ? 'Executing...' : 'Confirm Block'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Customer Modal */}
      <CustomerCreateModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchCustomers();
          showNotification('Customer created successfully', 'success');
        }}
        showNotification={showNotification}
      />

      {/* Create Account Modal */}
      <AccountCreateModal 
        isOpen={showAccountModal} 
        onClose={() => setShowAccountModal(false)}
        customer={selectedCustomerForAccount}
      />
    </div>
  );
};

export default AdminUsers;
