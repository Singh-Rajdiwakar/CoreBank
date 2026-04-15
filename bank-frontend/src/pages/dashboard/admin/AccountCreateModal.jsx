import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { accountAPI, adminAPI } from '../../../services/api';

const AccountCreateModal = ({ isOpen, onClose, customer }) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    branchId: '',
    accountType: 'SAVINGS',
    currency: 'INR',
    openingBalance: '500.00',
    minimumBalance: '500.00',
    interestRate: '3.50',
    overdraftLimit: '0.00'
  });

  useEffect(() => {
    if (isOpen) {
      loadBranches();
      setFormData({
        branchId: '',
        accountType: 'SAVINGS',
        currency: 'INR',
        openingBalance: '500.00',
        minimumBalance: '500.00',
        interestRate: '3.50',
        overdraftLimit: '0.00'
      });
      setToast({ show: false, message: '', type: '' });
    }
  }, [isOpen]);

  const loadBranches = async () => {
    try {
      const res = await adminAPI.getBranches();
      const branchList = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.content || res.data?.content || []));
      setBranches(branchList);
      if (branchList.length > 0) {
        setFormData(prev => ({ ...prev, branchId: branchList[0].id }));
      }
    } catch (e) {
      console.error('Failed to load branches', e);
      setBranches([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast({ show: false, message: '', type: '' });
    
    try {
      await accountAPI.createAccount({
        primaryCustomerId: customer.id,
        branchId: parseInt(formData.branchId),
        accountType: formData.accountType,
        currency: formData.currency,
        openingBalance: parseFloat(formData.openingBalance) || 0,
        minimumBalance: parseFloat(formData.minimumBalance) || 0,
        interestRate: parseFloat(formData.interestRate) || 0,
        overdraftLimit: parseFloat(formData.overdraftLimit) || 0
      });
      setToast({ show: true, message: 'Account opened successfully!', type: 'success' });
      setTimeout(() => {
        onClose(true);
      }, 1500);
    } catch (error) {
      setToast({ 
        show: true, 
        message: error.response?.data?.message || 'Failed to open account.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !customer) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-xl flex flex-col overflow-hidden max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Open New Account</h2>
                <p className="text-xs text-gray-500">For {customer.name || customer.fullName} ({customer.customerCode || customer.id})</p>
              </div>
            </div>
            <button
              onClick={() => onClose()}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {toast.show && (
              <div className={`mb-6 p-4 rounded-lg text-sm flex items-start gap-3 ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                <svg className={`w-5 h-5 shrink-0 ${toast.type === 'success' ? 'text-green-500' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {toast.type === 'success' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                <span className="font-medium">{toast.message}</span>
              </div>
            )}

            <form id="accountForm" onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Branch</label>
                  <select
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  >
                    <option value="">Select Branch</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.branchName || b.name || `Branch ${b.branchCode}`}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Account Type</label>
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  >
                    <option value="SAVINGS">Savings Account</option>
                    <option value="CURRENT">Current Account</option>
                    <option value="SALARY">Salary Account</option>
                    <option value="FIXED_DEPOSIT">Fixed Deposit</option>
                    <option value="RECURRING_DEPOSIT">Recurring Deposit</option>
                    <option value="WALLET">Digital Wallet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="interestRate"
                    value={formData.interestRate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Opening Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    name="openingBalance"
                    value={formData.openingBalance}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Minimum Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    name="minimumBalance"
                    value={formData.minimumBalance}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                </div>
                
                {formData.accountType === 'CURRENT' && (
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Overdraft Limit</label>
                    <input
                      type="number"
                      step="0.01"
                      name="overdraftLimit"
                      value={formData.overdraftLimit}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    />
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onClose()}
              className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="accountForm"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Open Account'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AccountCreateModal;