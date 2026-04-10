import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../../../services/api';
const Cog6ToothIcon = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 1.44a10.02 10.02 0 0 0-3.28 1.4L6.34 1.4A1.5 1.5 0 0 0 4.22 2.1l-1.06 2.6A9.97 9.97 0 0 0 1.4 7.98l-2.61-.41A1.5 1.5 0 0 0 -2.62 9l-1.48 2.6c-.23.4-.04.9.41 1.06l2.61.92a9.97 9.97 0 0 0 1.4 3.28l-1.42 2.45a1.5 1.5 0 0 0 .7 2.12l2.6 1.06a10.02 10.02 0 0 0 3.28 1.4l.72 2.76a1.5 1.5 0 0 0 1.9.9l2.76-.72a9.97 9.97 0 0 0 3.28-1.4l2.45 1.42a1.5 1.5 0 0 0 2.12-.7l1.06-2.6a10.02 10.02 0 0 0 1.4-3.28l2.76.72a1.5 1.5 0 0 0 1.9-.9l.72-2.76a9.97 9.97 0 0 0 1.4-3.28l1.42-2.45a1.5 1.5 0 0 0-.7-2.12l-2.6-1.06a10.02 10.02 0 0 0-1.4-3.28l.41-2.61a1.5 1.5 0 0 0-1.4-1.89l-2.6-1.48a9.97 9.97 0 0 0-3.28-1.4l-.9-1.9A1.5 1.5 0 0 0 13.1 1l-2.76.44zM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" /></svg>;
const CurrencyDollarIcon = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>;
const ChartBarIcon = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125z" /></svg>;
const CheckCircleIcon = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>;
const XCircleIcon = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 10.5 13.5 13.5m0-3-3 3m8.25-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>;
const PlusIcon = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;

const AdminConfig = () => {
  const [activeTab, setActiveTab] = useState('system');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [systemConfig, setSystemConfig] = useState({ globalFreeze: false, maintenanceMode: false });
  const [interests, setInterests] = useState([]);
  const [fees, setFees] = useState([]);

  // Form states
  const [interestForm, setInterestForm] = useState({ productType: '', annualRate: '', active: true });
  const [feeForm, setFeeForm] = useState({ feeCode: '', amount: '', percentage: '', active: true });

  const tabs = [
    { id: 'system', name: 'System Variables', icon: Cog6ToothIcon },
    { id: 'interests', name: 'Interest Rates', icon: ChartBarIcon },
    { id: 'fees', name: 'Fee Structures', icon: CurrencyDollarIcon },
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'system') {
        const res = await adminAPI.getSystemConfig();
        setSystemConfig(res.data?.data || res.data);
      } else if (activeTab === 'interests') {
        const res = await adminAPI.getInterests();
        setInterests(res.data?.data || res.data);
      } else if (activeTab === 'fees') {
        const res = await adminAPI.getFees();
        setFees(res.data?.data || res.data);
      }
    } catch (err) {
      setError('Failed to load configuration data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSystemUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminAPI.updateSystemConfig(systemConfig);
      showSuccess('System configuration updated successfully');
    } catch (err) {
      setError('Failed to update system config');
    } finally {
      setLoading(false);
    }
  };

  const handleInterestSubmit = async (e) => {
    e.preventDefault();
    if (!interestForm.productType || !interestForm.annualRate) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await adminAPI.updateInterest(interestForm);
      showSuccess('Interest rate added/updated successfully');
      fetchData(); // Refresh list
      setInterestForm({ productType: '', annualRate: '', active: true });
    } catch (err) {
      setError('Failed to save interest rate');
    } finally {
      setLoading(false);
    }
  };

  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    if (!feeForm.feeCode || (!feeForm.amount && !feeForm.percentage)) {
      setError('Please provide fee code and either amount or percentage');
      return;
    }
    if (parseFloat(feeForm.percentage) > 100) {
      setError('Percentage cannot exceed 100%');
      return;
    }
    setLoading(true);
    try {
      await adminAPI.updateFee(feeForm);
      showSuccess('Fee structure added/updated successfully');
      fetchData(); // Refresh list
      setFeeForm({ feeCode: '', amount: '', percentage: '', active: true });
    } catch (err) {
      setError('Failed to save fee structure');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Core Banking Configuration</h1>
          <p className="text-sm text-gray-500 mt-1">Manage highly sensitive system variables, rates, and fees.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <XCircleIcon className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className={`mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'}`} />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {loading && <div className="text-center text-gray-500 py-8">Loading configuration...</div>}
        
        {!loading && (
          <AnimatePresence mode="wait">
            {/* SYSTEM VARIABLES TAB */}
            {activeTab === 'system' && (
              <motion.div
                key="system"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-6">Global System Status</h3>
                <form onSubmit={handleSystemUpdate} className="space-y-6">
                  
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Global Freeze</h4>
                      <p className="text-sm text-red-600 mt-1">Halts all transactions system-wide. Use only in emergencies.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={systemConfig?.globalFreeze || false}
                        onChange={(e) => setSystemConfig({...systemConfig, globalFreeze: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-red-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Maintenance Mode</h4>
                      <p className="text-sm text-yellow-600 mt-1">Prevents standard user logins. Admin access remains active.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={systemConfig?.maintenanceMode || false}
                        onChange={(e) => setSystemConfig({...systemConfig, maintenanceMode: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-yellow-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                    </label>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save System Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* INTEREST RATES TAB */}
            {activeTab === 'interests' && (
              <motion.div
                key="interests"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Add New Rate Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Set Interest Rate</h3>
                  <form onSubmit={handleInterestSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300"
                        placeholder="e.g., SAVINGS_ACC"
                        value={interestForm.productType}
                        onChange={(e) => setInterestForm({...interestForm, productType: e.target.value.toUpperCase()})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Annual Rate (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300"
                        placeholder="4.50"
                        value={interestForm.annualRate}
                        onChange={(e) => setInterestForm({...interestForm, annualRate: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center h-10 mb-1">
                      <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2 h-4 w-4"
                          checked={interestForm.active}
                          onChange={(e) => setInterestForm({...interestForm, active: e.target.checked})}
                        />
                        Active Rate
                      </label>
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <PlusIcon className="w-5 h-5 mr-1" />
                        Save Rate
                      </button>
                    </div>
                  </form>
                </div>

                {/* Rates List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annual Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.isArray(interests) && interests.length > 0 ? interests.map((rate, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rate.productType}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rate.annualRate}%</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${rate.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {rate.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(rate.updatedAt || Date.now()).toLocaleDateString()}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No interest rates configured</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* FEE STRUCTURES TAB */}
            {activeTab === 'fees' && (
              <motion.div
                key="fees"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                 {/* Add New Fee Form */}
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Define Fee Structure</h3>
                  <form onSubmit={handleFeeSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fee Code</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300"
                        placeholder="e.g., IMPS_TRANSFER_FEE"
                        value={feeForm.feeCode}
                        onChange={(e) => setFeeForm({...feeForm, feeCode: e.target.value.toUpperCase()})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fixed Amount (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300"
                        placeholder="2.50"
                        value={feeForm.amount}
                        onChange={(e) => setFeeForm({...feeForm, amount: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Percentage (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 outline-none transition-all duration-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-300 bg-white"
                        placeholder="0.5"
                        value={feeForm.percentage}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || parseFloat(val) <= 100) {
                            setFeeForm({...feeForm, percentage: val});
                          }
                        }}
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <PlusIcon className="w-5 h-5 mr-1" />
                        Save Fee
                      </button>
                    </div>
                  </form>
                </div>

                {/* Fees List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fixed Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.isArray(fees) && fees.length > 0 ? fees.map((fee, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fee.feeCode}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {fee.amount ? `$${parseFloat(fee.amount).toFixed(2)}` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {fee.percentage ? `${fee.percentage}%` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${fee.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {fee.active !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No fee structures configured</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default AdminConfig;
